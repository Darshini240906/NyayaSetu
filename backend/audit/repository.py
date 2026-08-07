from db.repositories.base import TenantRepository


class AuditLogRepository(TenantRepository):
    collection_name = "audit_logs"

    async def log(self, org_id: str, data: dict) -> str:
        return await self.insert_one(org_id, data)
