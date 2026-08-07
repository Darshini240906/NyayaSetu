from core.extraction.pdf_extractor import ExtractionResult


async def extract_docx(content: bytes) -> ExtractionResult:
    try:
        import io
        from docx import Document
        doc = Document(io.BytesIO(content))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return ExtractionResult(text="\n\n".join(paragraphs), metadata={"paragraph_count": len(paragraphs)})
    except ImportError:
        return ExtractionResult(text="", metadata={"error": "python-docx not installed"})
    except Exception as e:
        return ExtractionResult(text="", metadata={"error": str(e)})
