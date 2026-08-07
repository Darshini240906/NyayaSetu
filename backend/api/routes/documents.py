from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from documents.models import DocumentRead
from documents.repository import DocumentRepository
from documents.service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])

def get_service(db: DatabaseDependency) -> DocumentService:
    return DocumentService(DocumentRepository(db))

@router.get("", response_model=list[DocumentRead])
async def list_documents(
    context: TenantContext = Depends(require_permission("documents:read")),
    service: DocumentService = Depends(get_service),
) -> list[DocumentRead]:
    return await service.list_documents(context)

@router.get("/{doc_id}/status")
async def doc_status(
    doc_id: str, db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("documents:read")),
) -> dict:
    repo = DocumentRepository(db)
    doc = await repo.find_by_id(context.org_id, doc_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return {"document_id": doc_id, "status": doc.get("status"), "filename": doc.get("filename")}

@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    context: TenantContext = Depends(require_permission("documents:manage")),
    service: DocumentService = Depends(get_service),
) -> dict:
    deleted = await service.delete_document(context, doc_id)
    if not deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return {"deleted": True, "document_id": doc_id}

@router.get("/{doc_id}/download")
async def download_document(
    doc_id: str,
    context: TenantContext = Depends(require_permission("documents:read")),
    service: DocumentService = Depends(get_service),
) -> Response:
    content, filename, content_type = await service.download_document(context, doc_id)
    safe_filename = filename.replace('"', "")
    return Response(
        content=content,
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{safe_filename}"'},
    )