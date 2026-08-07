'''

from db.repositories.base import TenantRepository

class DomainRepository(TenantRepository):
    collection_name = "domains"
    async def create_domain(self, org_id: str, data: dict) -> str:
        return await self.insert_one(org_id, data)
    async def list_domains(self, org_id: str) -> list[dict]:
        return await self.list_many(org_id, limit=100)
    async def find_by_name(self, org_id: str, name: str) -> dict | None:
        return await self.collection.find_one({"org_id": org_id, "name": name})
'''

from bson import ObjectId
from db.repositories.base import TenantRepository


class DomainRepository(TenantRepository):
    collection_name = "domains"

    async def create_domain(self, org_id: str, data: dict) -> str:
        return await self.insert_one(org_id, data)

    async def list_domains(self, org_id: str) -> list[dict]:
        return await self.list_many(org_id, limit=100)

    async def find_by_name(self, org_id: str, name: str) -> dict | None:
        return await self.collection.find_one({"org_id": org_id, "name": name})

    async def find_by_id(self, org_id: str, domain_id: str) -> dict | None:
        try:
            oid = ObjectId(domain_id)
        except Exception:
            return None
        return await self.collection.find_one({"_id": oid, "org_id": org_id})

    async def increment_member_count(self, org_id: str, domain_id: str, delta: int) -> None:
        try:
            oid = ObjectId(domain_id)
        except Exception:
            return
        await self.collection.update_one(
            {"_id": oid, "org_id": org_id},
            {"$inc": {"member_count": delta}},
        )