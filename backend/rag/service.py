# backend/rag/service.py
from __future__ import annotations
from core.context import TenantContext
from core.embeddings import EmbeddingService
from core.languages import get_language
from core.retrieval import QdrantRetrievalService, RetrievedChunk
from rag.models import Citation, QueryRequest, QueryResponse

BASE_SYSTEM_PROMPT = """You are NyayaSetu, an enterprise knowledge assistant.
Rules:
1. Answer ONLY from the provided context passages
2. Cite sources as [DocumentName, Page X] after each claim
3. If the answer is not in the context say: "I could not find this in your knowledge base."
4. Never fabricate information. Give complete, thorough answers using all relevant details from the context — don't artificially shorten your response. Be professional and well-organized.
5. Respond ONLY in {language_name}, regardless of what language the context passages are written in. Translate any cited content into {language_name} as needed."""


class LLMService:
    def __init__(self):
        self._groq = None
        self._gemini = None
        self._init()

    def _init(self):
        from config import settings
        groq_key = settings.groq_api_key.get_secret_value() if settings.groq_api_key else None
        if groq_key:
            try:
                from groq import Groq
                self._groq = Groq(api_key=groq_key)
            except Exception as e:
                print(f"Groq init: {e}")
        google_key = settings.google_api_key.get_secret_value() if settings.google_api_key else None
        if google_key and not self._groq:
            try:
                import google.generativeai as genai
                genai.configure(api_key=google_key)
                self._gemini = genai.GenerativeModel("gemini-1.5-flash")
            except Exception as e:
                print(f"Gemini init: {e}")

    async def generate(self, query: str, chunks: list[RetrievedChunk], language_code: str = "en") -> str:
        lang = get_language(language_code)
        system_prompt = BASE_SYSTEM_PROMPT.format(language_name=lang.llm_name)

        if not chunks:
            no_context_msg = {
                "en": "I could not find relevant information in your knowledge base. Please upload documents first.",
                "hi": "मुझे आपके नॉलेज बेस में संबंधित जानकारी नहीं मिली। कृपया पहले दस्तावेज़ अपलोड करें।",
                "ta": "உங்கள் அறிவுத் தளத்தில் தொடர்புடைய தகவல் எதுவும் கிடைக்கவில்லை. முதலில் ஆவணங்களைப் பதிவேற்றவும்.",
                "te": "మీ నాలెడ్జ్ బేస్‌లో సంబంధిత సమాచారం కనుగొనబడలేదు. దయచేసి ముందుగా పత్రాలను అప్‌లోడ్ చేయండి.",
                "mr": "तुमच्या नॉलेज बेसमध्ये संबंधित माहिती सापडली नाही. कृपया आधी कागदपत्रे अपलोड करा.",
            }
            return no_context_msg.get(lang.code, no_context_msg["en"])

        context = "\n\n---\n\n".join(
            f"[{c.metadata.get('document_name','Doc')}, Page {c.metadata.get('page_number',1)}]:\n{c.text}"
            for c in chunks[:5]
        )
        user_msg = f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer in {lang.llm_name} with citations:"
        if self._groq:
            return await self._groq_gen(system_prompt, user_msg)
        if self._gemini:
            return await self._gemini_gen(system_prompt, user_msg)
        return f"*LLM not configured. Add GROQ_API_KEY or GOOGLE_API_KEY to .env*\n\nRelevant content found:\n\n{context[:600]}"

    async def generate_report(self, instruction: str, chunks: list[RetrievedChunk], language_code: str = "en") -> str:
        """Generate a structured, source-bound report from retrieved passages."""
        lang = get_language(language_code)
        context = "\n\n---\n\n".join(
            f"[{c.metadata.get('document_name', 'Document')}, Page {c.metadata.get('page_number', 1)}]:\n{c.text}"
            for c in chunks[:12]
        )
        system_prompt = (
            "You are NyayaSetu's enterprise reporting assistant. "
            "Use only the supplied source passages. Never make up facts, owners, dates, conclusions, or citations. "
            f"Write only in {lang.llm_name}."
        )
        user_msg = f"Sources:\n{context}\n\nTask: {instruction}"
        if self._groq:
            return await self._groq_gen(system_prompt, user_msg)
        if self._gemini:
            return await self._gemini_gen(system_prompt, user_msg)
        return "## Source material\n\n" + "\n\n".join(
            f"- {c.text[:500]} [{c.metadata.get('document_name', 'Document')}, Page {c.metadata.get('page_number', 1)}]"
            for c in chunks[:5]
        )

    async def generate_raw(self, system_prompt: str, user_msg: str) -> str:
        """Direct system+user prompt completion, no retrieval involved.
        Used by features (e.g. legal document analysis) that need the LLM to
        reason over a full document rather than retrieved chunks."""
        if self._groq:
            return await self._groq_gen(system_prompt, user_msg)
        if self._gemini:
            return await self._gemini_gen(system_prompt, user_msg)
        return ""

    async def _groq_gen(self, system_prompt: str, msg: str) -> str:
        import asyncio
        try:
            r = await asyncio.get_event_loop().run_in_executor(None, lambda: self._groq.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": msg}],
                max_tokens=1800, temperature=0.1
            ))
            return r.choices[0].message.content
        except Exception as e:
            return f"LLM error: {e}"

    async def _gemini_gen(self, system_prompt: str, msg: str) -> str:
        import asyncio
        try:
            r = await asyncio.get_event_loop().run_in_executor(None, lambda: self._gemini.generate_content(f"{system_prompt}\n\n{msg}"))
            return r.text
        except Exception as e:
            return f"LLM error: {e}"


_llm = None

def get_llm():
    global _llm
    if _llm is None:
        _llm = LLMService()
    return _llm


async def run_rag(context: TenantContext, request: QueryRequest) -> QueryResponse:
    embedder = EmbeddingService()
    retrieval = QdrantRetrievalService()
    llm = get_llm()

    vec = await embedder.embed_text(request.query)
    chunks = await retrieval.search(context, vec, limit=request.limit)

    # Confidence scoring
    if chunks:
        score = min(1.0, sum(c.final_score for c in chunks[:3]) / min(3, len(chunks)))
        label = "high" if score > 0.85 else "medium" if score >= 0.70 else "low"
    else:
        score, label = 0.0, "low"

    # Simple contradiction check
    contradiction = False
    if len(chunks) >= 2:
        texts = [c.text.lower() for c in chunks]
        for a, b in [("is required","is not required"),("must not","must"),("not allowed","allowed")]:
            if any(a in t for t in texts) and any(b in t for t in texts):
                contradiction = True
                break

    answer = await llm.generate(request.query, chunks, request.language)
    return QueryResponse(
        answer=answer, confidence=score, confidence_label=label,
        contradiction_flag=contradiction,
        citations=[Citation(
            document_id=c.document_id, chunk_id=c.chunk_id, score=c.final_score,
            document_name=c.metadata.get("document_name",""),
            page_number=c.metadata.get("page_number",1),
            text_snippet=c.text[:200]
        ) for c in chunks]
    )