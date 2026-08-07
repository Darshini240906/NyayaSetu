# backend/api/routes/query.py
from fastapi import APIRouter, Depends
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from audit.repository import AuditLogRepository
from audit.service import AuditService
from chat.repository import ChatRepository, ConversationRepository
from core.context import TenantContext
from rag.models import QueryRequest, QueryResponse
from rag.service import run_rag

router = APIRouter(prefix="/query", tags=["query"])


def _make_title(text: str, max_len: int = 48) -> str:
    text = text.strip()
    return text if len(text) <= max_len else text[:max_len].rstrip() + "…"


@router.post("", response_model=QueryResponse)
async def query(
    request: QueryRequest,
    db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("query:run")),
) -> QueryResponse:
    conv_repo = ConversationRepository(db)
    chat_repo = ChatRepository(db)

    conversation_id = request.conversation_id
    if conversation_id:
        # Make sure this conversation actually belongs to this user.
        conv = await conv_repo.find_for_user(context.org_id, context.user_id, conversation_id)
        if not conv:
            conversation_id = None

    if not conversation_id:
        conversation_id = await conv_repo.create_conversation(
            context.org_id, context.user_id, _make_title(request.query)
        )
        # Keep only the 5 most recent conversations for this user.
        dropped_ids = await conv_repo.enforce_limit(context.org_id, context.user_id)
        if dropped_ids:
            await chat_repo.delete_for_conversations(context.org_id, dropped_ids)

    result = await run_rag(context, request)

    audit = AuditService(AuditLogRepository(db))
    await audit.log_query(context, request.query, result.model_dump())

    await chat_repo.add_message(context.org_id, context.user_id, conversation_id, {
        "role": "user", "content": request.query, "language": request.language,
    })
    await chat_repo.add_message(context.org_id, context.user_id, conversation_id, {
        "role": "assistant", "content": result.answer, "language": request.language,
        "meta": {
            "confidence": result.confidence, "confidence_label": result.confidence_label,
            "contradiction_flag": result.contradiction_flag,
            "citations": [c.model_dump() for c in result.citations],
        },
    })
    await conv_repo.touch(context.org_id, conversation_id)

    result.conversation_id = conversation_id
    return result