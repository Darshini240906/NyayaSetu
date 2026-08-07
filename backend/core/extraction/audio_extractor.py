from __future__ import annotations
from core.extraction.pdf_extractor import ExtractionResult
from core.transcription import transcribe_audio


async def extract_audio(content: bytes, filename: str, language: str = "en") -> ExtractionResult:
    """Transcribe an uploaded audio file so it can be chunked, embedded, and
    indexed through the same pipeline as PDF/DOCX/TXT documents."""
    text, error = await transcribe_audio(content, filename, language)
    if error:
        return ExtractionResult(text="", metadata={"source_type": "audio", "filename": filename, "error": error})
    return ExtractionResult(text=text, metadata={"source_type": "audio", "filename": filename, "language": language})