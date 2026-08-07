from __future__ import annotations
from core.context import TenantContext
from legal.models import KeyDate
from reminders.models import Reminder, ReminderCreate
from reminders.repository import ReminderRepository


def _to_model(doc: dict) -> Reminder:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return Reminder(**doc)


class ReminderService:
    def __init__(self, repository: ReminderRepository):
        self.repo = repository

    async def create(self, context: TenantContext, data: ReminderCreate) -> Reminder:
        reminder_id = await self.repo.create(context.org_id, context.user_id, {
            "title": data.title, "due_date": data.due_date, "note": data.note,
            "case_id": data.case_id, "synced_to_calendar": False, "calendar_event_id": None,
        })
        doc = await self.repo.find_by_id(context.org_id, context.user_id, reminder_id)
        return _to_model(doc)

    async def create_from_key_dates(self, context: TenantContext, case_id: str, key_dates: list[KeyDate]) -> list[Reminder]:
        """Auto-create reminders for any deadline-type key date that has a real
        parseable date. Dates the model couldn't confidently parse are skipped
        here — the person can still see them in the case summary and add a
        reminder manually with the correct date."""
        created = []
        for kd in key_dates:
            if kd.is_deadline and kd.date:
                reminder = await self.create(context, ReminderCreate(
                    title=kd.label, due_date=kd.date, note=kd.raw_text, case_id=case_id,
                ))
                created.append(reminder)
        return created

    async def list_reminders(self, context: TenantContext) -> list[Reminder]:
        docs = await self.repo.list_for_user(context.org_id, context.user_id)
        return [_to_model(d) for d in docs]

    async def update(self, context: TenantContext, reminder_id: str, patch: dict) -> Reminder | None:
        await self.repo.update(context.org_id, context.user_id, reminder_id, patch)
        doc = await self.repo.find_by_id(context.org_id, context.user_id, reminder_id)
        return _to_model(doc) if doc else None

    async def delete(self, context: TenantContext, reminder_id: str) -> None:
        await self.repo.delete(context.org_id, context.user_id, reminder_id)

    async def mark_synced(self, context: TenantContext, reminder_id: str, event_id: str) -> None:
        await self.repo.update(context.org_id, context.user_id, reminder_id, {
            "synced_to_calendar": True, "calendar_event_id": event_id,
        })
