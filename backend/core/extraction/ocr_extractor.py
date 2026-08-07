# backend/core/extraction/ocr_extractor.py
import os
import platform
import shutil
from core.extraction.pdf_extractor import ExtractionResult
from core.languages import OCR_LANGUAGE_STRING

# Windows dev machines need explicit paths to the Tesseract/Poppler binaries;
# Linux containers (Docker/Hugging Face Spaces) get them from PATH via apt-get
# install tesseract-ocr poppler-utils, so no explicit path is needed there.
# Override via env vars if your install location differs from the defaults below.
WINDOWS_TESSERACT_PATH = os.environ.get("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
WINDOWS_POPPLER_PATH = os.environ.get("POPPLER_PATH")  # e.g. r"C:\poppler\Library\bin"


def _configure_tesseract_cmd(pytesseract) -> None:
    if platform.system() == "Windows":
        if os.path.exists(WINDOWS_TESSERACT_PATH):
            pytesseract.pytesseract.tesseract_cmd = WINDOWS_TESSERACT_PATH
        # else: fall through and hope it's on PATH
    # On Linux/Mac, rely on `tesseract` being on PATH (apt/brew install).


def _poppler_path() -> str | None:
    if platform.system() == "Windows":
        return WINDOWS_POPPLER_PATH
    return None  # Linux/Mac: pdf2image finds poppler on PATH


async def extract_ocr(content: bytes, is_pdf: bool = True) -> ExtractionResult:
    try:
        import io
        import pytesseract
        _configure_tesseract_cmd(pytesseract)
        if not shutil.which("tesseract") and platform.system() != "Windows":
            return ExtractionResult(text="", metadata={
                "error": "tesseract binary not found on PATH. Install it (e.g. `apt-get install "
                         "tesseract-ocr` in your Dockerfile) or disable OCR-dependent uploads."
            })
        from pdf2image import convert_from_bytes
        from PIL import Image

        if is_pdf:
            images = convert_from_bytes(content, dpi=300, poppler_path=_poppler_path())
        else:
            images = [Image.open(io.BytesIO(content))]

        texts = []
        for img in images:
            t = pytesseract.image_to_string(img, lang=OCR_LANGUAGE_STRING)
            if t.strip():
                texts.append(t)
        return ExtractionResult(text="\n\n".join(texts), metadata={"ocr": True, "pages": len(images), "ocr_languages": OCR_LANGUAGE_STRING})
    except ImportError as e:
        return ExtractionResult(text="", metadata={"error": f"OCR dependency missing: {e}"})
    except Exception as e:
        return ExtractionResult(text="", metadata={"error": str(e)})