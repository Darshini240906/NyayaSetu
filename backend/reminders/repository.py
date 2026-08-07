from __future__ import annotations
from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class ReminderRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["reminders"]
        self.tokens = db["calendar_tokens"]

    async def create(self, org_id: str, user_id: str, data: dict) -> str:
        # ensure due_date is stored as a timezone-aware datetime for reliable comparisons
        due = data.get("due_date")
        if isinstance(due, str):
            try:
                due_dt = datetime.fromisoformat(due)
            except Exception:
                due_dt = datetime.strptime(due, "%Y-%m-%d")
            if due_dt.tzinfo is None:
                due_dt = due_dt.replace(tzinfo=timezone.utc)
            data["due_date"] = due_dt

        doc = {**data, "org_id": org_id, "user_id": user_id, "created_at": datetime.now(timezone.utc)}
        result = await self.collection.insert_one(doc)
        return str(result.inserted_id)

    async def list_for_user(self, org_id: str, user_id: str) -> list[dict]:
        cursor = self.collection.find({"org_id": org_id, "user_id": user_id}).sort("due_date", 1)
        return [doc async for doc in cursor]

    async def find_by_id(self, org_id: str, user_id: str, reminder_id: str) -> dict | None:
        if not ObjectId.is_valid(reminder_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(reminder_id), "org_id": org_id, "user_id": user_id})

    async def update(self, org_id: str, user_id: str, reminder_id: str, patch: dict) -> None:
        if not ObjectId.is_valid(reminder_id):
            return
        await self.collection.update_one(
            {"_id": ObjectId(reminder_id), "org_id": org_id, "user_id": user_id}, {"$set": patch}
        )

    async def delete(self, org_id: str, user_id: str, reminder_id: str) -> None:
        if not ObjectId.is_valid(reminder_id):
            return
        await self.collection.delete_one({"_id": ObjectId(reminder_id), "org_id": org_id, "user_id": user_id})

    # --- Google Calendar tokens (one doc per user) ---
    async def save_tokens(self, org_id: str, user_id: str, tokens: dict) -> None:
        await self.tokens.update_one(
            {"org_id": org_id, "user_id": user_id},
            {"$set": {"org_id": org_id, "user_id": user_id, "tokens": tokens,
                      "updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )

    async def get_tokens(self, org_id: str, user_id: str) -> dict | None:
        doc = await self.tokens.find_one({"org_id": org_id, "user_id": user_id})
        return doc.get("tokens") if doc else None

    # --- Reminder delivery helpers ---
    async def list_due_reminders(self, cutoff: datetime) -> list[dict]:
        cursor = self.collection.find({"due_date": {"$lte": cutoff}, "notified": {"$ne": True}})
        return [doc async for doc in cursor]

    async def mark_notified(self, reminder_id: str) -> None:
        if not ObjectId.is_valid(reminder_id):
            return
        await self.collection.update_one({"_id": ObjectId(reminder_id)}, {"$set": {"notified": True, "notified_at": datetime.utcnow()}})
