# backend/api/routes/reminders.py
from fastapi import APIRouter, Depends, HTTPException, status
from api.dependencies.get_current_user import get_current_user
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from reminders.models import Reminder, ReminderCreate
from reminders.repository import ReminderRepository
from reminders.service import ReminderService

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


@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: str, db: DatabaseDependency, context: TenantContext = Depends(get_current_user),
) -> dict:
    service = ReminderService(ReminderRepository(db))
    await service.delete(context, reminder_id)
    return {"status": "deleted"}
