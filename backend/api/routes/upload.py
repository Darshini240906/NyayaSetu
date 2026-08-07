from fastapi import APIRouter, Depends, File, Form, UploadFile
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from core.enums import DocumentClassification
from documents.models import UploadResponse, YouTubeUploadRequest
from documents.repository import DocumentRepository
from documents.service import DocumentService

router = APIRouter(prefix="/upload", tags=["upload"])


def get_service(db: DatabaseDependency) -> DocumentService:
    return DocumentService(DocumentRepository(db))


@router.post("", response_model=UploadResponse)
async def upload(
    file: UploadFile = File(...),
    classification: DocumentClassification = Form(DocumentClassification.INTERNAL),
    language: str = Form(default="en"),
    context: TenantContext = Depends(require_permission("documents:upload")),
    service: DocumentService = Depends(get_service),
) -> UploadResponse:
    # `language` only matters for audio files (used as the Whisper transcription
    # hint); other file types ignore it.
    return await service.upload(context, file, classification, language)


@router.post("/youtube", response_model=UploadResponse)
async def upload_youtube(
    payload: YouTubeUploadRequest,
    context: TenantContext = Depends(require_permission("documents:upload")),
    service: DocumentService = Depends(get_service),
) -> UploadResponse:
    return await service.upload_youtube(context, payload.url, payload.classification, payload.language)