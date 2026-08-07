from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel


class ReminderCreate(BaseModel):
    title: str
    due_date: str          # ISO date, e.g. "2026-09-12" — what the frontend sends in
    note: str | None = None
    case_id: str | None = None


class Reminder(BaseModel):
    id: str
    title: str
    due_date: datetime     # what's actually stored in Mongo — FastAPI serializes this
                            # back to an ISO string automatically, so the frontend's
                            # `new Date(r.due_date)` keeps working unchanged
    note: str | None = None
    case_id: str | None = None
    synced_to_calendar: bool = False
    calendar_event_id: str | None = None
    created_at: datetime | None = None