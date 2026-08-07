'''from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from domains.repository import DomainRepository
from domains.service import DomainService
from domains.models import DomainCreate, DomainRead, DOMAIN_TYPES

router = APIRouter(prefix="/domains", tags=["domains"])

def get_svc(db: DatabaseDependency) -> DomainService:
    return DomainService(DomainRepository(db))

@router.get("/types")
async def domain_types() -> list[str]:
    return DOMAIN_TYPES

@router.get("", response_model=list[DomainRead])
async def list_domains(context: TenantContext = Depends(require_permission("documents:read")), svc: DomainService = Depends(get_svc)) -> list[DomainRead]:
    return await svc.list_domains(context)

@router.post("", response_model=DomainRead, status_code=201)
async def create_domain(req: DomainCreate, context: TenantContext = Depends(require_permission("domains:manage")), svc: DomainService = Depends(get_svc)) -> DomainRead:
    return await svc.create_domain(context, req)

@router.delete("/{domain_id}")
async def delete_domain(domain_id: str, context: TenantContext = Depends(require_permission("domains:manage")), svc: DomainService = Depends(get_svc)) -> dict:
    await svc.delete_domain(context, domain_id)
    return {"deleted": True}
'''
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from domains.repository import DomainRepository
from domains.service import DomainService
from domains.models import DomainCreate, DomainRead, DOMAIN_TYPES

router = APIRouter(prefix="/domains", tags=["domains"])

def get_svc(db: DatabaseDependency) -> DomainService:
    return DomainService(DomainRepository(db), db)

@router.get("/types")
async def domain_types() -> list[str]:
    return DOMAIN_TYPES

@router.get("", response_model=list[DomainRead])
async def list_domains(context: TenantContext = Depends(require_permission("documents:read")), svc: DomainService = Depends(get_svc)) -> list[DomainRead]:
    return await svc.list_domains(context)

@router.post("", response_model=DomainRead, status_code=201)
async def create_domain(req: DomainCreate, context: TenantContext = Depends(require_permission("domains:manage")), svc: DomainService = Depends(get_svc)) -> DomainRead:
    return await svc.create_domain(context, req)

@router.get("/{domain_id}/members")
async def list_domain_members(domain_id: str, context: TenantContext = Depends(require_permission("domains:manage")), svc: DomainService = Depends(get_svc)) -> list[dict]:
    return await svc.list_members(context, domain_id)

@router.delete("/{domain_id}")
async def delete_domain(domain_id: str, context: TenantContext = Depends(require_permission("domains:manage")), svc: DomainService = Depends(get_svc)) -> dict:
    await svc.delete_domain(context, domain_id)
    return {"deleted": True}