"""Stores original uploaded file bytes in MongoDB GridFS so documents can be
downloaded later. The document's Mongo record keeps a `file_id` pointing at
the GridFS file. Documents uploaded before this feature existed won't have a
`file_id` and can't be downloaded until re-uploaded."""
from __future__ import annotations
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorGridFSBucket


class DocumentStorage:
    def __init__(self, database: AsyncIOMotorDatabase):
        self._bucket = AsyncIOMotorGridFSBucket(database, bucket_name="document_files")

    async def save(self, filename: str, content: bytes, content_type: str) -> str:
        file_id = await self._bucket.upload_from_stream(
            filename, content, metadata={"content_type": content_type},
        )
        return str(file_id)

    async def load(self, file_id: str) -> bytes | None:
        try:
            oid = ObjectId(file_id)
        except (InvalidId, TypeError):
            return None
        try:
            stream = await self._bucket.open_download_stream(oid)
            return await stream.read()
        except Exception:
            return None