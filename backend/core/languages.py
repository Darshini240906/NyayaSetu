# backend/core/languages.py
"""
Single source of truth for the languages NyayaSetu's chatbot supports.
Used by: rag/service.py (LLM response language), api/routes/voice.py
(Whisper transcription hint), core/extraction/ocr_extractor.py (Tesseract OCR).
"""

class LanguageInfo:
    def __init__(self, code: str, label: str, llm_name: str, whisper_code: str, tesseract_code: str):
        self.code = code                    # short code used across the app, e.g. "hi"
        self.label = label                  # display label, e.g. "Hindi"
        self.llm_name = llm_name            # name to put in the LLM prompt
        self.whisper_code = whisper_code    # ISO-639-1 code Groq Whisper accepts
        self.tesseract_code = tesseract_code  # Tesseract OCR language pack code


SUPPORTED_LANGUAGES: dict[str, LanguageInfo] = {
    "en": LanguageInfo("en", "English", "English", "en", "eng"),
    "hi": LanguageInfo("hi", "Hindi", "Hindi (हिंदी)", "hi", "hin"),
    "ta": LanguageInfo("ta", "Tamil", "Tamil (தமிழ்)", "ta", "tam"),
    "te": LanguageInfo("te", "Telugu", "Telugu (తెలుగు)", "te", "tel"),
    "mr": LanguageInfo("mr", "Marathi", "Marathi (मराठी)", "mr", "mar"),
}

DEFAULT_LANGUAGE = "en"

# Combined Tesseract language string so OCR can read any of the supported
# scripts in a single pass without needing to know the document's language
# up front. Requires the corresponding tesseract-ocr-<code> packs installed.
OCR_LANGUAGE_STRING = "+".join(l.tesseract_code for l in SUPPORTED_LANGUAGES.values())


def get_language(code: str | None) -> LanguageInfo:
    return SUPPORTED_LANGUAGES.get((code or "").lower(), SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE])