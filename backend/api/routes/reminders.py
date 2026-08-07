# backend/api/routes/reminders.py
from fastapi import APIRouter, Depends, HTTPException, status
from api.dependencies.get_current_user import get_current_user
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from reminders.models import Reminder, ReminderCreate
from reminders.repository import ReminderRepository
from reminders.service import ReminderService
from fastapi import Response
from datetime import datetime
from reminders.ics import build_ics

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("", response_model=list[Reminder])
async def list_reminders(db: DatabaseDependency, context: TenantContext = Depends(get_current_user)) -> list[Reminder]:
    service = ReminderService(ReminderRepository(db))
    return await service.list_reminders(context)


@router.post("", response_model=Reminder)
async def create_reminder(
    data: ReminderCreate, db: DatabaseDependency, context: TenantContext = Depends(get_current_user),
) -> Reminder:
    service = ReminderService(ReminderRepository(db))
    return await service.create(context, data)


@router.put("/{reminder_id}", response_model=Reminder)
async def update_reminder(
    reminder_id: str, data: ReminderCreate, db: DatabaseDependency,
    context: TenantContext = Depends(get_current_user),
) -> Reminder:
    service = ReminderService(ReminderRepository(db))
    updated = await service.update(context, reminder_id, data.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reminder not found")
    return updated

@router.get("/{reminder_id}/ics")
async def download_reminder_ics(
    reminder_id: str, db: DatabaseDependency, context: TenantContext = Depends(get_current_user),
) -> Response:
    repo = ReminderRepository(db)
    reminder = await repo.find_by_id(context.org_id, context.user_id, reminder_id)
    if not reminder:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reminder not found")

    due = reminder["due_date"]
    if isinstance(due, str):
        due = datetime.fromisoformat(due)

    ics_content = build_ics(reminder["title"], due, reminder.get("note"))
    safe_name = "".join(c for c in reminder["title"] if c.isalnum() or c in " -_").strip() or "reminder"
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}.ics"'},
    )


@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: str, db: DatabaseDependency, context: TenantContext = Depends(get_current_user),
) -> dict:
    service = ReminderService(ReminderRepository(db))
    await service.delete(context, reminder_id)
    return {"status": "deleted"}
