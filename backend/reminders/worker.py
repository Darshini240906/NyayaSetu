from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from bson import ObjectId
from db.mongo import mongo_manager
from reminders.repository import ReminderRepository
from core.email import send_email


async def _send_reminder_email(user_email: str, title: str, due_date: datetime, note: str | None) -> None:
    subject = f"Reminder: {title}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 640px; margin: auto;">
      <h2>{title}</h2>
      <p>Due: <strong>{due_date.astimezone(timezone.utc).isoformat()}</strong></p>
      <p>{note or ''}</p>
      <p>This is an automated reminder from NyayaSetu.</p>
    </div>
    """
    await send_email(user_email, subject, html)


async def run_reminder_loop(poll_interval: int = 60) -> None:
    """Background loop: check for due reminders and email users."""
    # Wait until DB is ready
    while True:
        try:
            db = mongo_manager.get_database()
            break
        except RuntimeError:
            await asyncio.sleep(1)

    repo = ReminderRepository(mongo_manager.get_database())
    users = mongo_manager.get_database()["users"]

    while True:
        try:
            cutoff = datetime.now(timezone.utc)
            due = await repo.list_due_reminders(cutoff)
            for r in due:
                try:
                    user_id = r.get("user_id")
                    user = None
                    if ObjectId.is_valid(user_id or ""):
                        user = await users.find_one({"_id": ObjectId(user_id)})
                    if not user and r.get("email"):
                        user = {"email": r.get("email"), "full_name": r.get("title")}

                    if user and user.get("email"):
                        await _send_reminder_email(user.get("email"), r.get("title"), r.get("due_date"), r.get("note"))
                    await repo.mark_notified(str(r.get("_id")))
                except Exception as e:
                    print(f"[REMINDER ERROR] Failed to send reminder {r.get('_id')}: {e}")
        except Exception as e:
            print(f"[REMINDER WORKER] Loop error: {e}")
        await asyncio.sleep(poll_interval)


__all__ = ["run_reminder_loop"]
