'''from enum import Enum


class Role(str, Enum):
    ORG_SUPER_ADMIN = "org_super_admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    GUEST = "guest"
    CUSTOM = "custom"


class DocumentClassification(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    RESTRICTED = "restricted"
    CONFIDENTIAL = "confidential"


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class AgeTag(str, Enum):
    NEW = "new"
    RECENT = "recent"
    OLD = "old"
    OUTDATED = "outdated"


class FreshnessTag(str, Enum):
    FRESH = "fresh"
    STALE = "stale"
    EXPIRED = "expired"
    UNVERIFIED = "unverified"


class UsageTag(str, Enum):
    ACTIVE = "active"
    UNUSED = "unused"
    LEAST_USED = "least_used"
    FREQUENTLY_USED = "frequently_used"


CLASSIFICATION_LEVELS: dict[DocumentClassification, int] = {
    DocumentClassification.PUBLIC: 1,
    DocumentClassification.INTERNAL: 2,
    DocumentClassification.RESTRICTED: 3,
    DocumentClassification.CONFIDENTIAL: 4,
}

ROLE_MAX_CLASSIFICATION: dict[Role, DocumentClassification] = {
    Role.ORG_SUPER_ADMIN: DocumentClassification.CONFIDENTIAL,
    Role.MANAGER: DocumentClassification.RESTRICTED,
    Role.EMPLOYEE: DocumentClassification.INTERNAL,
    Role.GUEST: DocumentClassification.PUBLIC,
    Role.CUSTOM: DocumentClassification.INTERNAL,
}
'''

from enum import Enum


class Role(str, Enum):
    ORG_SUPER_ADMIN = "org_super_admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    GUEST = "guest"
    CUSTOM = "custom"


class DocumentClassification(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class AgeTag(str, Enum):
    NEW = "new"
    RECENT = "recent"
    OLD = "old"
    OUTDATED = "outdated"


class FreshnessTag(str, Enum):
    FRESH = "fresh"
    STALE = "stale"
    EXPIRED = "expired"
    UNVERIFIED = "unverified"


class UsageTag(str, Enum):
    ACTIVE = "active"
    UNUSED = "unused"
    LEAST_USED = "least_used"
    FREQUENTLY_USED = "frequently_used"