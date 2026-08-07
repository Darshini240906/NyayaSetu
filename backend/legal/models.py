from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field
from legal.enums import CaseType, DocumentStrengthStatus, TriageFlag


class TimelineStage(BaseModel):
    key: str
    title: str
    typical_duration: str
    responsible_party: str
    documents_needed: list[str] = []
    what_happens: str
    if_missed: str
    is_current: bool = False


class KeyDate(BaseModel):
    label: str
    date: str | None = None          # ISO date string if the model could parse one, else None
    raw_text: str | None = None      # what the document actually said, if no clean date was found
    is_deadline: bool = False


class StrengthItem(BaseModel):
    label: str
    status: DocumentStrengthStatus
    note: str | None = None


class CaseStrengthReport(BaseModel):
    items: list[StrengthItem]
    overall_score: int = Field(ge=0, le=100)


class AnalyzeRequest(BaseModel):
    language: str = "en"
    case_type_hint: CaseType | None = None


class LegalCase(BaseModel):
    id: str
    case_type: CaseType
    title: str
    plain_language_summary: str
    rights: list[str] = []
    obligations: list[str] = []
    key_dates: list[KeyDate] = []
    timeline: list[TimelineStage]
    strength: CaseStrengthReport
    disclaimer: str = (
        "This is an AI-generated explanation to help you understand your document. "
        "It is not legal advice. Please consult a lawyer or your nearest legal aid "
        "clinic before taking any action."
    )
    created_at: datetime | None = None


class CourtCase(BaseModel):
    id: str
    case_number: str
    case_type: CaseType
    filed_date: str | None = None
    next_hearing_date: str | None = None
    adjournment_count: int = 0
    documents_complete: bool = True
    notes: str | None = None
    triage_score: int = Field(ge=0, le=100)
    triage_flag: TriageFlag
    created_at: datetime | None = None


class CourtCaseCreate(BaseModel):
    case_number: str
    case_type: CaseType
    filed_date: str | None = None
    next_hearing_date: str | None = None
    adjournment_count: int = 0
    documents_complete: bool = True
    notes: str | None = None
