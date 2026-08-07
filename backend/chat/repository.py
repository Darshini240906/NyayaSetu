# backend/chat/repository.py
from __future__ import annotations
from typing import Any
from bson import ObjectId
from datetime import UTC, datetime
from db.repositories.base import TenantRepository

MAX_CONVERSATIONS_PER_USER = 5


class ConversationRepository(TenantRepository):
    collection_name = "conversations"

    async def create_conversation(self, org_id: str, user_id: str, title: str) -> str:
        return await self.insert_one(org_id, {"user_id": user_id, "title": title})

    async def list_for_user(self, org_id: str, user_id: str, limit: int = MAX_CONVERSATIONS_PER_USER) -> list[dict]:
        cursor = (
            self.collection.find({"org_id": org_id, "user_id": user_id})
            .sort("updated_at", -1)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def find_for_user(self, org_id: str, user_id: str, conversation_id: str) -> dict | None:
        try:
            return await self.collection.find_one({
                "_id": ObjectId(conversation_id), "org_id": org_id, "user_id": user_id,
            })
        except Exception:
            return None

    async def touch(self, org_id: str, conversation_id: str) -> None:
        try:
            await self.collection.update_one(
                {"_id": ObjectId(conversation_id), "org_id": org_id},
                {"$set": {"updated_at": datetime.now(UTC)}},
            )
        except Exception:
            pass

    async def delete_for_user(self, org_id: str, user_id: str, conversation_id: str) -> bool:
        try:
            result = await self.collection.delete_one({
                "_id": ObjectId(conversation_id), "org_id": org_id, "user_id": user_id,
            })
            return result.deleted_count > 0
        except Exception:
            return False

    async def enforce_limit(self, org_id: str, user_id: str, limit: int = MAX_CONVERSATIONS_PER_USER) -> list[str]:
        """Keeps only the `limit` most recently updated conversations for this
        user; returns the ids of any older conversations that got dropped so
        their messages can be purged too."""
        cursor = (
            self.collection.find({"org_id": org_id, "user_id": user_id})
            .sort("updated_at", -1)
            .skip(limit)
        )
        overflow = await cursor.to_list(length=None)
        overflow_ids = [str(d["_id"]) for d in overflow]
        if overflow_ids:
            await self.collection.delete_many({"_id": {"$in": [ObjectId(i) for i in overflow_ids]}})
        return overflow_ids


class ChatRepository(TenantRepository):
    collection_name = "chat_messages"

    async def add_message(self, org_id: str, user_id: str, conversation_id: str, data: dict[str, Any]) -> str:
        return await self.insert_one(org_id, {"user_id": user_id, "conversation_id": conversation_id, **data})

    async def list_for_conversation(self, org_id: str, user_id: str, conversation_id: str, limit: int = 200) -> list[dict]:
        cursor = (
            self.collection.find({"org_id": org_id, "user_id": user_id, "conversation_id": conversation_id})
            .sort("created_at", 1)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def delete_for_conversation(self, org_id: str, conversation_id: str) -> int:
        result = await self.collection.delete_many({"org_id": org_id, "conversation_id": conversation_id})
        return result.deleted_count

    async def delete_for_conversations(self, org_id: str, conversation_ids: list[str]) -> int:
        if not conversation_ids:
            return 0
        result = await self.collection.delete_many({"org_id": org_id, "conversation_id": {"$in": conversation_ids}})
        return result.deleted_count