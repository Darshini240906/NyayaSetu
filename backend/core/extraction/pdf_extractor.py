from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class ExtractionResult:
    text: str
    metadata: dict = field(default_factory=dict)


async def extract_pdf(content: bytes) -> ExtractionResult:
    try:
        import io
        import pdfplumber
        text_parts = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            meta = {"page_count": len(pdf.pages)}
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
        full_text = "\n\n".join(text_parts)
        if len(full_text.strip()) < 50:
            meta["ocr_required"] = True
        return ExtractionResult(text=full_text, metadata=meta)
    except ImportError:
        return ExtractionResult(text="", metadata={"error": "pdfplumber not installed", "ocr_required": True})
    except Exception as e:
        return ExtractionResult(text="", metadata={"error": str(e), "ocr_required": True})
