from __future__ import annotations
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings


class MongoManager:
    def __init__(self):
        self._client: AsyncIOMotorClient | None = None
        self._db: AsyncIOMotorDatabase | None = None

    async def connect(self):
        self._client = AsyncIOMotorClient(settings.mongodb_uri)
        self._db = self._client[settings.mongodb_database]
        await self._create_indexes()
        print(f"MongoDB connected: {settings.mongodb_database}")

    async def _create_indexes(self):
        try:
            await self._db["users"].create_index([("org_id", 1), ("email", 1)], unique=True)
            await self._db["documents"].create_index([("org_id", 1), ("created_at", -1)])
            await self._db["audit_logs"].create_index([("org_id", 1), ("created_at", -1)])
            await self._db["domains"].create_index([("org_id", 1), ("name", 1)])
        except Exception as e:
            print(f"Index creation warning: {e}")

    async def close(self):
        if self._client:
            self._client.close()

    def get_database(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            raise RuntimeError("Database not connected")
        return self._db


mongo_manager = MongoManager()
