'''from typing import Any
from db.repositories.base import TenantRepository


class DocumentRepository(TenantRepository):
    collection_name = "documents"

    async def create_document(self, org_id: str, data: dict[str, Any]) -> str:
        return await self.insert_one(org_id, data)

    async def find_by_id(self, org_id: str, doc_id: str) -> dict | None:
        return await super().find_by_id(org_id, doc_id)'''

from typing import Any
from db.repositories.base import TenantRepository


class DocumentRepository(TenantRepository):
    collection_name = "documents"

    async def create_document(self, org_id: str, data: dict[str, Any]) -> str:
        return await self.insert_one(org_id, data)

    async def find_by_id(self, org_id: str, doc_id: str) -> dict | None:
        return await super().find_by_id(org_id, doc_id)

    async def list_accessible(self, org_id: str, user_id: str, domain_id: str | None, full_access: bool = False) -> list[dict]:
        base = {"org_id": org_id, "status": {"$ne": "deleted"}}
        if full_access:
            query = base
        else:
            or_clauses = [
                {"classification": "public"},
                {"classification": "confidential", "uploaded_by": user_id},
            ]
            if domain_id:
                or_clauses.append({"classification": "internal", "domain_id": domain_id})
            query = {**base, "$or": or_clauses}
        cursor = self.collection.find(query).sort("created_at", -1).limit(200)
        return await cursor.to_list(length=200)

    async def get_org_created_at(self, org_id: str):
        """When the company started using NyayaSetu — the reference point age_tag is judged against."""
        from bson import ObjectId
        org = await self._db["organizations"].find_one({"_id": ObjectId(org_id)})
        return org.get("created_at") if org else None