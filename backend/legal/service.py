from __future__ import annotations
import json
import re
from pathlib import Path
from fastapi import HTTPException, UploadFile, status
from core.context import TenantContext
from core.extraction.docx_extractor import extract_docx
from core.extraction.ocr_extractor import extract_ocr
from core.extraction.pdf_extractor import extract_pdf
from core.extraction.txt_extractor import extract_txt
from core.languages import get_language
from legal.enums import CaseType, DocumentStrengthStatus
from legal.models import (
    AnalyzeRequest, CaseStrengthReport, KeyDate, LegalCase, StrengthItem,
)
from legal.repository import LegalCaseRepository
from legal.timeline_templates import get_timeline
from rag.service import get_llm

ANALYSIS_SYSTEM_PROMPT = """You are a careful legal-document explainer for ordinary citizens in India who \
are not lawyers. You are given the raw text of one legal document (a notice, FIR, complaint, summons, \
application, etc). Respond ONLY with a single valid JSON object, no markdown fences, no commentary, \
matching exactly this shape:

{{
  "case_type": one of ["consumer_complaint","civil_suit","criminal_fir","family_matrimonial",
                        "property_dispute","labour_employment","rti_application","other"],
  "title": short 6-10 word plain-language title for this document,
  "plain_language_summary": 3-6 sentences in {language_name}, explaining what this document is and what \
it means for the person, in plain non-legal language,
  "rights": array of up to 5 short strings describing what rights the person has,
  "obligations": array of up to 5 short strings describing what the person must do and by when,
  "key_dates": array of objects {{"label": str, "date": "YYYY-MM-DD or null", "raw_text": "what the \
document actually said, e.g. 'within 15 days of receipt'", "is_deadline": true/false}},
  "document_checklist": array of exactly these 4 objects, each with a "status" field set to one of \
"strong","available","missing","not_mentioned" based on what's actually in the document text, plus a short \
"note": [
     {{"label": "Core Document / Notice", "status": "...", "note": "..."}},
     {{"label": "Proof of Delivery / Receipt", "status": "...", "note": "..."}},
     {{"label": "Supporting Evidence (invoices, correspondence, etc.)", "status": "...", "note": "..."}},
     {{"label": "Witnesses / Third-party Corroboration", "status": "...", "note": "..."}}
  ]
}}

Rules:
- Base everything ONLY on the document text given. Never invent facts, case numbers, or outcomes.
- Never predict who will "win". Only describe what exists and what's missing.
- If you cannot confidently find a real calendar date, set "date" to null and rely on "raw_text".
- Respond only in {language_name} for the summary/rights/obligations/notes text. Keep case_type, status, \
and date fields in English/ISO format as specified.
"""


def _extract_json(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r"^```(json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in LLM response")
    return json.loads(match.group(0))


class LegalAnalysisService:
    def __init__(self, repository: LegalCaseRepository):
        self.repo = repository

    async def _extract_text(self, file: UploadFile) -> str:
        ext = Path(file.filename or "").suffix.lower()
        content = await file.read()
        if len(content) > 25 * 1024 * 1024:
            raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "File too large (max 25MB)")

        if ext == ".pdf":
            result = await extract_pdf(content)
            if result.metadata.get("ocr_required"):
                result = await extract_ocr(content, is_pdf=True)
        elif ext == ".docx":
            result = await extract_docx(content)
        elif ext in (".png", ".jpg", ".jpeg"):
            result = await extract_ocr(content, is_pdf=False)
        elif ext == ".txt":
            result = await extract_txt(content)
        else:
            raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, f"File type {ext} not supported")

        if not result.text.strip():
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Could not extract any text from this file")
        return result.text

    async def analyze(self, context: TenantContext, file: UploadFile, request: AnalyzeRequest) -> LegalCase:
        text = await self._extract_text(file)
        lang = get_language(request.language)
        llm = get_llm()

        system_prompt = ANALYSIS_SYSTEM_PROMPT.format(language_name=lang.llm_name)
        # Cap document length sent to the model to keep this fast/cheap; legal notices
        # and FIRs are rarely so long that the first ~12k characters miss the substance.
        user_msg = f"Document text:\n\n{text[:12000]}"

        raw = await llm.generate_raw(system_prompt, user_msg)
        parsed = self._parse_or_fallback(raw, text)

        try:
            case_type = CaseType(parsed.get("case_type", "other"))
        except ValueError:
            case_type = CaseType.OTHER

        strength = self._build_strength(parsed.get("document_checklist", []))
        key_dates = [KeyDate(**kd) for kd in parsed.get("key_dates", []) if kd.get("label")]
        timeline = get_timeline(case_type)

        case = LegalCase(
            id="",
            case_type=case_type,
            title=parsed.get("title") or "Legal Document Analysis",
            plain_language_summary=parsed.get("plain_language_summary", ""),
            rights=parsed.get("rights", [])[:5],
            obligations=parsed.get("obligations", [])[:5],
            key_dates=key_dates,
            timeline=timeline,
            strength=strength,
        )

        saved_id = await self.repo.create(context.org_id, context.user_id, case.model_dump(exclude={"id"}))
        case.id = saved_id
        return case

    def _parse_or_fallback(self, raw: str, source_text: str) -> dict:
        try:
            return _extract_json(raw)
        except Exception:
            # LLM not configured, or returned something unparseable — degrade gracefully
            # instead of failing the whole request.
            return {
                "case_type": "other",
                "title": "Legal Document",
                "plain_language_summary": (
                    "We couldn't reach the language model to generate a plain-language summary "
                    "right now. Here is a short excerpt from your document instead:\n\n"
                    + source_text[:400]
                ),
                "rights": [], "obligations": [], "key_dates": [], "document_checklist": [],
            }

    def _build_strength(self, checklist: list[dict]) -> CaseStrengthReport:
        default_labels = [
            "Core Document / Notice", "Proof of Delivery / Receipt",
            "Supporting Evidence (invoices, correspondence, etc.)",
            "Witnesses / Third-party Corroboration",
        ]
        by_label = {c.get("label"): c for c in checklist if c.get("label")}
        items: list[StrengthItem] = []
        weights = {
            DocumentStrengthStatus.STRONG: 100, DocumentStrengthStatus.AVAILABLE: 75,
            DocumentStrengthStatus.NOT_MENTIONED: 40, DocumentStrengthStatus.MISSING: 10,
        }
        total = 0
        for label in default_labels:
            raw = by_label.get(label, {})
            try:
                status_val = DocumentStrengthStatus(raw.get("status", "not_mentioned"))
            except ValueError:
                status_val = DocumentStrengthStatus.NOT_MENTIONED
            items.append(StrengthItem(label=label, status=status_val, note=raw.get("note")))
            total += weights[status_val]
        overall = round(total / len(default_labels)) if default_labels else 0
        return CaseStrengthReport(items=items, overall_score=overall)

    async def get(self, context: TenantContext, case_id: str) -> LegalCase | None:
        doc = await self.repo.find_by_id(context.org_id, context.user_id, case_id)
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        return LegalCase(**doc)

    async def list_cases(self, context: TenantContext) -> list[LegalCase]:
        docs = await self.repo.list_for_user(context.org_id, context.user_id)
        cases = []
        for doc in docs:
            doc["id"] = str(doc.pop("_id"))
            cases.append(LegalCase(**doc))
        return cases
