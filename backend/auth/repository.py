from datetime import UTC, datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class AuthRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.users = db["users"]
        self.orgs = db["organizations"]
        self.tokens = db["password_reset_tokens"]

    async def find_org_by_slug(self, slug: str) -> dict | None:
        return await self.orgs.find_one({"slug": slug})

    async def find_user_by_email(self, org_id: str, email: str) -> dict | None:
        return await self.users.find_one({"org_id": org_id, "email": email.lower()})

    async def create_org(self, data: dict) -> str:
        result = await self.orgs.insert_one({"created_at": datetime.now(UTC), **data})
        return str(result.inserted_id)

    async def create_user(self, data: dict) -> str:
        result = await self.users.insert_one({"created_at": datetime.now(UTC), "updated_at": datetime.now(UTC), **data})
        return str(result.inserted_id)

    async def create_setup_token(self, org_id: str, user_id: str, email: str, code: str, minutes: int = 30) -> str:
        result = await self.tokens.insert_one({
            "org_id": org_id,
            "user_id": user_id,
            "email": email.lower(),
            "code": code,
            "used": False,
            "created_at": datetime.now(UTC),
            "expires_at": datetime.now(UTC) + timedelta(minutes=minutes),
        })
        return str(result.inserted_id)

    async def find_valid_token(self, org_id: str, email: str, code: str) -> dict | None:
        return await self.tokens.find_one({
            "org_id": org_id,
            "email": email.lower(),
            "code": code,
            "used": False,
            "expires_at": {"$gt": datetime.now(UTC)},
        })

    async def mark_token_used(self, token_id: str) -> None:
        await self.tokens.update_one({"_id": ObjectId(token_id)}, {"$set": {"used": True}})

    async def set_user_password(self, user_id: str, hashed_password: str) -> None:
        await self.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"hashed_password": hashed_password, "must_reset_password": False, "updated_at": datetime.now(UTC)}},
        )
