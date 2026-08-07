from datetime import datetime
from pydantic import BaseModel
from core.enums import AgeTag, DocumentClassification, DocumentStatus, FreshnessTag, UsageTag


class DocumentRead(BaseModel):
    id: str
    org_id: str
    uploaded_by: str
    filename: str
    content_type: str
    classification: DocumentClassification
    domain_id: str | None = None
    status: DocumentStatus
    usage_tag: UsageTag
    age_tag: AgeTag
    freshness_tag: FreshnessTag
    document_weight: float
    metadata: dict = {}
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UploadResponse(BaseModel):
    document: DocumentRead
    extracted_text: str
    extraction_metadata: dict


class YouTubeUploadRequest(BaseModel):
    url: str
    classification: DocumentClassification = DocumentClassification.INTERNAL
    language: str = "en"