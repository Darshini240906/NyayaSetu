from core.extraction.pdf_extractor import ExtractionResult


async def extract_txt(content: bytes) -> ExtractionResult:
    try:
        import chardet
        detected = chardet.detect(content)
        encoding = detected.get("encoding") or "utf-8"
        text = content.decode(encoding, errors="replace")
        return ExtractionResult(text=text, metadata={"encoding": encoding})
    except Exception as e:
        return ExtractionResult(text=content.decode("utf-8", errors="replace"), metadata={"error": str(e)})
