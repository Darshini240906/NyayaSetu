# backend/api/routes/chat_history.py
from fastapi import APIRouter, Depends, HTTPException, status
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from chat.models import ChatMessageOut, ConversationListResponse, ConversationMessagesResponse, ConversationOut
from chat.repository import ChatRepository, ConversationRepository
from core.context import TenantContext

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("query:run")),
) -> ConversationListResponse:
    repo = ConversationRepository(db)
    convs = await repo.list_for_user(context.org_id, context.user_id)
    return ConversationListResponse(conversations=[
        ConversationOut(id=str(c["_id"]), title=c.get("title", "New chat"), updated_at=c["updated_at"].isoformat())
        for c in convs
    ])


@router.get("/conversations/{conversation_id}/messages", response_model=ConversationMessagesResponse)
async def get_conversation_messages(
    conversation_id: str,
    db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("query:run")),
) -> ConversationMessagesResponse:
    conv_repo = ConversationRepository(db)
    conv = await conv_repo.find_for_user(context.org_id, context.user_id, conversation_id)
    if not conv:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")

    chat_repo = ChatRepository(db)
    docs = await chat_repo.list_for_conversation(context.org_id, context.user_id, conversation_id)
    return ConversationMessagesResponse(
        conversation_id=conversation_id,
        messages=[
            ChatMessageOut(
                id=str(d["_id"]), role=d["role"], content=d["content"],
                language=d.get("language", "en"), created_at=d["created_at"].isoformat(),
                meta=d.get("meta"),
            ) for d in docs
        ],
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("query:run")),
) -> dict:
    conv_repo = ConversationRepository(db)
    conv = await conv_repo.find_for_user(context.org_id, context.user_id, conversation_id)
    if not conv:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")

    chat_repo = ChatRepository(db)
    await chat_repo.delete_for_conversation(context.org_id, conversation_id)
    await conv_repo.delete_for_user(context.org_id, context.user_id, conversation_id)
    return {"deleted": True}