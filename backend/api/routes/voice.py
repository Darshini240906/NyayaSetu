# backend/api/routes/voice.py
from fastapi import APIRouter, Depends, File, Form, UploadFile
from api.dependencies.check_permissions import require_permission
from core.context import TenantContext
from core.transcription import transcribe_audio

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/query")
async def voice_query(
    audio: UploadFile = File(...),
    language: str = Form(default="en"),
    context: TenantContext = Depends(require_permission("query:run")),
) -> dict:
    content = await audio.read()
    transcript, error = await transcribe_audio(content, audio.filename or "audio.webm", language)
    if error:
        return {"transcribed_text": "", "status": "error", "error": error, "filename": audio.filename}
    return {"transcribed_text": transcript, "status": "transcribed", "filename": audio.filename}