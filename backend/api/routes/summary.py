"""Knowledge-grounded summaries and generated reports."""
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, model_validator

from api.dependencies.check_permissions import require_permission
from core.context import TenantContext
from core.embeddings import EmbeddingService
from core.retrieval import QdrantRetrievalService, RetrievedChunk
from rag.service import get_llm


ReportType = Literal["executive_summary", "technical_summary", "action_items", "research_insights"]

REPORT_TYPE_DETAILS = {
    "executive_summary": {
        "label": "Executive summary",
        "instruction": "Give a short leadership-ready overview: purpose, most important findings, business impact, risks, and recommended next steps.",
    },
    "technical_summary": {
        "label": "Technical summary",
        "instruction": "Explain the technical scope, approach, architecture or implementation details, dependencies, constraints, risks, and open questions.",
    },
    "action_items": {
        "label": "Action items",
        "instruction": "Extract concrete action items. Use a checklist. Include owner and due date only when explicitly present; otherwise write Unassigned and No date. Finish with decisions and open questions.",
    },
    "research_insights": {
        "label": "Research insights",
        "instruction": "Synthesize key findings, evidence, patterns, implications, limitations, and follow-up research questions. Keep facts distinct from inferences.",
    },
}


class ReportRequest(BaseModel):
    """Either provide source text (ideal for meeting notes), a knowledge-base topic, or both."""

    topic: str = Field(default="", max_length=1000)
    content: str = Field(default="", max_length=50000)
    report_type: ReportType = "executive_summary"
    title: str = Field(default="", max_length=200)
    language: str = Field(default="en", max_length=10)
    limit: int = Field(default=8, ge=1, le=20)

    @model_validator(mode="after")
    def has_a_source(self):
        if not self.topic.strip() and not self.content.strip():
            raise ValueError("Provide a topic to search or text to summarize.")
        return self


class SummaryRequest(ReportRequest):
    """Legacy request name retained for clients already calling /summary."""


router = APIRouter(tags=["reports"])


def _inline_notes(content: str) -> list[RetrievedChunk]:
    if not content.strip():
        return []
    # The LLM receives a source-shaped passage, so citations remain truthful for
    # pasted meeting notes as well as retrieved documents.
    return [RetrievedChunk(
        chunk_id="provided-notes",
        document_id="provided-notes",
        text=content.strip(),
        similarity_score=1.0,
        document_weight=1.0,
        final_score=1.0,
        metadata={"document_name": "Provided notes", "page_number": 1},
    )]


async def _generate_report(request: ReportRequest, context: TenantContext) -> dict:
    chunks = _inline_notes(request.content)
    if request.topic.strip():
        vector = await EmbeddingService().embed_text(request.topic.strip())
        retrieved = await QdrantRetrievalService().search(context, vector, limit=request.limit)
        chunks.extend(retrieved)

    details = REPORT_TYPE_DETAILS[request.report_type]
    subject = request.title.strip() or request.topic.strip() or "Provided notes"
    if not chunks:
        return {
            "title": subject,
            "report_type": request.report_type,
            "report_type_label": details["label"],
            "report": "No relevant knowledge-base documents were found for this topic.",
            "summary": "No relevant knowledge-base documents were found for this topic.",
            "source_count": 0,
            "sources": [],
        }

    prompt = (
        f"Create a {details['label'].lower()} for '{subject}'. {details['instruction']} "
        "Use only the supplied sources. Use clear Markdown headings and concise bullets where useful. "
        "Cite each factual claim as [Document name, Page X]. Do not invent owners, dates, facts, or citations."
    )
    report = await get_llm().generate_report(prompt, chunks, request.language)
    sources = [
        {
            "document_id": chunk.document_id,
            "document_name": chunk.metadata.get("document_name", ""),
            "page_number": chunk.metadata.get("page_number", 1),
            "score": round(chunk.final_score, 4),
        }
        for chunk in chunks
    ]
    return {
        "title": subject,
        "report_type": request.report_type,
        "report_type_label": details["label"],
        "report": report,
        # summary is maintained as an API compatibility alias.
        "summary": report,
        "source_count": len(sources),
        "sources": sources,
    }


@router.get("/reports/types")
async def report_types(context: TenantContext = Depends(require_permission("query:run"))) -> dict:
    return {"types": [{"id": key, "label": value["label"]} for key, value in REPORT_TYPE_DETAILS.items()]}


@router.post("/reports")
async def generate_report(
    request: ReportRequest,
    context: TenantContext = Depends(require_permission("query:run")),
) -> dict:
    return await _generate_report(request, context)


@router.post("/summary")
async def generate_summary(
    request: SummaryRequest,
    context: TenantContext = Depends(require_permission("query:run")),
) -> dict:
    return await _generate_report(request, context)