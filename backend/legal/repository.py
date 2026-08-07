from __future__ import annotations
from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class LegalCaseRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["legal_cases"]

    async def create(self, org_id: str, user_id: str, data: dict) -> str:
        doc = {**data, "org_id": org_id, "user_id": user_id, "created_at": datetime.now(timezone.utc)}
        result = await self.collection.insert_one(doc)
        return str(result.inserted_id)

    async def find_by_id(self, org_id: str, user_id: str, case_id: str) -> dict | None:
        if not ObjectId.is_valid(case_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(case_id), "org_id": org_id, "user_id": user_id})

    async def list_for_user(self, org_id: str, user_id: str, limit: int = 20) -> list[dict]:
        cursor = self.collection.find({"org_id": org_id, "user_id": user_id}).sort("created_at", -1).limit(limit)
        return [doc async for doc in cursor]


class CourtCaseRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["court_cases"]

    async def create(self, org_id: str, data: dict) -> str:
        doc = {**data, "org_id": org_id, "created_at": datetime.now(timezone.utc)}
        result = await self.collection.insert_one(doc)
        return str(result.inserted_id)

    async def list_for_org(self, org_id: str) -> list[dict]:
        cursor = self.collection.find({"org_id": org_id}).sort("created_at", -1)
        return [doc async for doc in cursor]

    async def find_by_id(self, org_id: str, case_id: str) -> dict | None:
        if not ObjectId.is_valid(case_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(case_id), "org_id": org_id})
