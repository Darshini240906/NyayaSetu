"""
Shared Groq-hosted Whisper transcription helper.
Used by: api/routes/voice.py (live voice queries), core/extraction/audio_extractor.py
(uploaded audio files), core/extraction/youtube_extractor.py (YouTube audio fallback
when no captions are available).
"""
from __future__ import annotations
import asyncio
import os
import tempfile

from config import settings
from core.languages import get_language


async def transcribe_audio(content: bytes, filename: str, language: str = "en") -> tuple[str, str | None]:
    """Transcribe raw audio bytes via Groq's hosted Whisper API.

    Returns (transcript, error). transcript is "" when error is set.
    """
    groq_key = settings.groq_api_key.get_secret_value() if settings.groq_api_key else None
    if not groq_key:
        return "", "GROQ_API_KEY not configured in .env"

    whisper_lang = get_language(language).whisper_code
    ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ".webm"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        from groq import Groq
        client = Groq(api_key=groq_key, timeout=30.0, max_retries=1)

        def _call():
            with open(tmp_path, "rb") as f:
                return client.audio.transcriptions.create(
                    file=(filename, f.read()),
                    model="whisper-large-v3-turbo",
                    response_format="text",
                    language=whisper_lang,
                )

        result = await asyncio.get_event_loop().run_in_executor(None, _call)
        text = result if isinstance(result, str) else getattr(result, "text", "")
        return text.strip(), None
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Groq transcription failed for %s", filename)
        return "", f"{type(e).__name__}: {e}"
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)