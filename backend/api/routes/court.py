# backend/api/routes/court.py
from fastapi import APIRouter, Depends, HTTPException, status
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from legal.court_service import score_case
from legal.models import CourtCase, CourtCaseCreate
from legal.repository import CourtCaseRepository

router = APIRouter(prefix="/court", tags=["court"])


def _to_model(doc: dict) -> CourtCase:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return CourtCase(**doc)


@router.post("/cases", response_model=CourtCase)
async def register_case(
    data: CourtCaseCreate, db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("court:manage")),
) -> CourtCase:
    repo = CourtCaseRepository(db)
    score, flag = score_case(data.case_type, data.filed_date, data.adjournment_count, data.documents_complete)
    case_id = await repo.create(context.org_id, {
        **data.model_dump(), "triage_score": score, "triage_flag": flag.value,
    })
    doc = await repo.find_by_id(context.org_id, case_id)
    return _to_model(doc)


@router.get("/cases", response_model=list[CourtCase])
async def list_court_cases(
    db: DatabaseDependency, context: TenantContext = Depends(require_permission("court:manage")),
) -> list[CourtCase]:
    repo = CourtCaseRepository(db)
    docs = await repo.list_for_org(context.org_id)
    return [_to_model(d) for d in docs]


@router.get("/cases/{case_id}", response_model=CourtCase)
async def get_court_case(
    case_id: str, db: DatabaseDependency, context: TenantContext = Depends(require_permission("court:manage")),
) -> CourtCase:
    repo = CourtCaseRepository(db)
    doc = await repo.find_by_id(context.org_id, case_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case not found")
    return _to_model(doc)