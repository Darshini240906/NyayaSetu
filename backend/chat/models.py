# backend/chat/models.py
from pydantic import BaseModel


class ChatMessageOut(BaseModel):
    id: str
    role: str            # "user" | "assistant"
    content: str
    language: str = "en"
    created_at: str
    meta: dict | None = None


class ConversationOut(BaseModel):
    id: str
    title: str
    updated_at: str


class ConversationListResponse(BaseModel):
    conversations: list[ConversationOut]


class ConversationMessagesResponse(BaseModel):
    conversation_id: str
    messages: list[ChatMessageOut]