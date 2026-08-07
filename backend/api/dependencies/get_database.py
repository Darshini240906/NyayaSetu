from typing import Annotated
from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from db.mongo import mongo_manager


async def get_database() -> AsyncIOMotorDatabase:
    return mongo_manager.get_database()

DatabaseDependency = Annotated[AsyncIOMotorDatabase, Depends(get_database)]
