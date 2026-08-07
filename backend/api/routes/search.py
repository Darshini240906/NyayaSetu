from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from api.dependencies.check_permissions import require_permission
from core.context import TenantContext
from core.embeddings import EmbeddingService
from core.retrieval import QdrantRetrievalService

router = APIRouter(prefix="/search", tags=["search"])

class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    limit: int = Field(default=10, ge=1, le=20)

@router.post("")
async def semantic_search(
    request: SearchRequest,
    context: TenantContext = Depends(require_permission("query:run")),
) -> dict:
    vec = await EmbeddingService().embed_text(request.query)
    chunks = await QdrantRetrievalService().search(context, vec, limit=request.limit)
    return {
        "query": request.query,
        "results": [
            {
                "document_name": c.metadata.get("document_name", ""),
                "page_number": c.metadata.get("page_number", 1),
                "text": c.text,
                "score": round(c.final_score, 4),
                "document_id": c.document_id,
            }
            for c in chunks
        ],
        "total": len(chunks),
    }
