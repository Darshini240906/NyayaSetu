from __future__ import annotations
from datetime import UTC, datetime
from typing import Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class TenantRepository:
    collection_name: str = ""

    def __init__(self, database: AsyncIOMotorDatabase):
        self._db = database
        self.collection = database[self.collection_name]

    async def insert_one(self, org_id: str, data: dict[str, Any]) -> str:
        now = datetime.now(UTC)
        doc = {"org_id": org_id, "created_at": now, "updated_at": now, **data}
        result = await self.collection.insert_one(doc)
        return str(result.inserted_id)

    async def find_by_id(self, org_id: str, doc_id: str) -> dict[str, Any] | None:
        try:
            return await self.collection.find_one({"_id": ObjectId(doc_id), "org_id": org_id})
        except Exception:
            return None

    async def list_many(self, org_id: str, limit: int = 100, skip: int = 0) -> list[dict[str, Any]]:
        cursor = self.collection.find({"org_id": org_id}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_by_id(self, org_id: str, doc_id: str, update: dict[str, Any]) -> bool:
        try:
            update["updated_at"] = datetime.now(UTC)
            result = await self.collection.update_one(
                {"_id": ObjectId(doc_id), "org_id": org_id},
                {"$set": update}
            )
            return result.matched_count > 0
        except Exception:
            return False

    async def delete_by_id(self, org_id: str, doc_id: str) -> bool:
        try:
            result = await self.collection.delete_one({"_id": ObjectId(doc_id), "org_id": org_id})
            return result.deleted_count > 0
        except Exception:
            return False
