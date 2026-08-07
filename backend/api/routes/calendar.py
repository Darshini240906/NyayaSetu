# backend/api/routes/calendar.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from api.dependencies.get_current_user import get_current_user
from api.dependencies.get_database import DatabaseDependency
from config import settings
from core.context import TenantContext
from reminders.repository import ReminderRepository
from reminders.service import ReminderService

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/status")
async def calendar_status(db: DatabaseDependency, context: TenantContext = Depends(get_current_user)) -> dict:
    repo = ReminderRepository(db)
    tokens = await repo.get_tokens(context.org_id, context.user_id)
    return {"connected": bool(tokens)}


@router.get("/oauth/url")
async def calendar_oauth_url(context: TenantContext = Depends(get_current_user)) -> dict:
    from calendar_integration.google_calendar import get_authorization_url
    # Encode who this callback is for in the OAuth `state` param since Google
    # redirects back without our auth header.
    state = f"{context.org_id}:{context.user_id}"
    try:
        url = get_authorization_url(state)
    except RuntimeError as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))
    return {"url": url}


@router.get("/oauth/callback")
async def calendar_oauth_callback(db: DatabaseDependency, code: str = Query(...), state: str = Query(...)):
    from calendar_integration.google_calendar import exchange_code
    try:
        org_id, user_id = state.split(":", 1)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid state")

    tokens = exchange_code(code)
    repo = ReminderRepository(db)
    await repo.save_tokens(org_id, user_id, tokens)

    return RedirectResponse(url=f"{settings.frontend_base_url}/reminders?calendar=connected")


@router.post("/sync/{reminder_id}")
async def sync_reminder_to_calendar(
    reminder_id: str, db: DatabaseDependency, context: TenantContext = Depends(get_current_user),
) -> dict:
    from calendar_integration.google_calendar import create_event

    repo = ReminderRepository(db)
    tokens = await repo.get_tokens(context.org_id, context.user_id)
    if not tokens:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Connect Google Calendar first")

    reminder = await repo.find_by_id(context.org_id, context.user_id, reminder_id)
    if not reminder:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reminder not found")

    event_id = create_event(tokens, reminder["title"], reminder["due_date"], reminder.get("note"))

    service = ReminderService(repo)
    await service.mark_synced(context, reminder_id, event_id)
    return {"status": "synced", "calendar_event_id": event_id}
