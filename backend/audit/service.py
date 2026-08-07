from audit.models import AuditLogRead
from audit.repository import AuditLogRepository
from core.context import TenantContext


class AuditService:
    def __init__(self, repo: AuditLogRepository):
        self.repo = repo

    async def log_query(self, context: TenantContext, query: str, response: dict) -> None:
        try:
            await self.repo.log(context.org_id, {
                "user_id": context.user_id,
                "domain_id": context.domain_id,
                "query": query,
                "answer": response.get("answer", ""),
                "confidence": response.get("confidence", 0),
                "confidence_label": response.get("confidence_label", "low"),
                "contradiction_flag": response.get("contradiction_flag", False),
                "sources": response.get("citations", []),
            })
        except Exception as e:
            print(f"Audit log error: {e}")

    async def list_logs(self, context: TenantContext) -> list[dict]:
        logs = await self.repo.list_many(context.org_id, limit=100)
        result = []
        for l in logs:
            l["id"] = str(l.pop("_id"))
            result.append(l)
        return result
