'''from dataclasses import dataclass
from core.enums import DocumentClassification, Role


@dataclass
class TenantContext:
    org_id: str
    user_id: str
    role: Role
    permissions: set[str]
    max_classification: DocumentClassification

    def has_permission(self, permission: str) -> bool:
        return "*" in self.permissions or permission in self.permissions'''

from dataclasses import dataclass
from core.enums import Role


@dataclass
class TenantContext:
    org_id: str
    user_id: str
    role: Role
    permissions: set[str]
    domain_id: str | None = None

    def has_permission(self, permission: str) -> bool:
        return "*" in self.permissions or permission in self.permissions