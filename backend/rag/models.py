from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=4000)
    limit: int = Field(default=8, ge=1, le=20)
    language: str = Field(default="en")
    conversation_id: str | None = None  # None = start a new conversation


class Citation(BaseModel):
    document_id: str
    chunk_id: str
    score: float
    document_name: str = ""
    page_number: int = 1
    text_snippet: str = ""


class QueryResponse(BaseModel):
    answer: str
    confidence: float
    confidence_label: str
    contradiction_flag: bool
    citations: list[Citation]
    conversation_id: str = ""