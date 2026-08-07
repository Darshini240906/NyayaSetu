from datetime import datetime
from pydantic import BaseModel


class AuditLogRead(BaseModel):
    id: str
    org_id: str
    user_id: str
    query: str
    answer: str
    confidence: float
    confidence_label: str
    contradiction_flag: bool
    sources: list[dict]
    created_at: datetime | None = None
