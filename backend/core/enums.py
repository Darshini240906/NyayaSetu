from enum import Enum


class Role(str, Enum):
    ORG_SUPER_ADMIN = "org_super_admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    GUEST = "guest"
    COURT = "court"
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