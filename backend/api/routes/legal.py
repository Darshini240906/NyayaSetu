# backend/api/routes/legal.py
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from api.dependencies.get_current_user import get_current_user
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from legal.models import AnalyzeRequest, LegalCase
from legal.repository import LegalCaseRepository
from legal.service import LegalAnalysisService
from reminders.repository import ReminderRepository
from reminders.service import ReminderService

router = APIRouter(prefix="/legal", tags=["legal"])


@router.post("/analyze", response_model=LegalCase)
async def analyze_document(
    db: DatabaseDependency,
    file: UploadFile = File(...),
    language: str = Form("en"),
    context: TenantContext = Depends(get_current_user),
) -> LegalCase:
    service = LegalAnalysisService(LegalCaseRepository(db))
    case = await service.analyze(context, file, AnalyzeRequest(language=language))

    # Auto-create in-app + (later) calendar reminders for any deadline the
    # model found a real date for.
    reminder_service = ReminderService(ReminderRepository(db))
    await reminder_service.create_from_key_dates(context, case.id, case.key_dates)

    return case


@router.get("/cases", response_model=list[LegalCase])
async def list_cases(
    db: DatabaseDependency, context: TenantContext = Depends(get_current_user),
) -> list[LegalCase]:
    service = LegalAnalysisService(LegalCaseRepository(db))
    return await service.list_cases(context)


@router.get("/cases/{case_id}", response_model=LegalCase)
async def get_case(
    case_id: str, db: DatabaseDependency, context: TenantContext = Depends(get_current_user),
) -> LegalCase:
    service = LegalAnalysisService(LegalCaseRepository(db))
    case = await service.get(context, case_id)
    if not case:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case not found")
    return case
