from datetime import datetime
from pydantic import BaseModel, Field

DOMAIN_TYPES = ["hr","finance","it","manufacturing","legal","sales","marketing","operations","custom"]

class DomainCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    domain_type: str = Field(default="custom")
    description: str = Field(default="", max_length=500)

class DomainRead(BaseModel):
    id: str; org_id: str; name: str; domain_type: str; description: str
    member_count: int = 0; document_count: int = 0; created_at: datetime | None = None
