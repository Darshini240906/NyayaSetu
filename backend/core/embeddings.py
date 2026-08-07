from __future__ import annotations
import math, hashlib
from config import settings

_model = None

def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("intfloat/multilingual-e5-large")
        except Exception as e:
            print(f"SentenceTransformer load failed: {e}. Using fallback embedder.")
    return _model


def _hash_embed(text: str) -> list[float]:
    dim = settings.embedding_dimension
    vals = [0.0] * dim
    for i, token in enumerate(text.lower().split()):
        d = hashlib.sha256(token.encode()).digest()
        slot = int.from_bytes(d[:4], "big") % dim
        vals[slot] += (1.0 if d[4] % 2 == 0 else -1.0) * (1.0 + (i % 7) / 10)
    norm = math.sqrt(sum(v * v for v in vals)) or 1.0
    return [v / norm for v in vals]


class EmbeddingService:
    async def embed_text(self, text: str) -> list[float]:
        model = _get_model()
        if model:
            import asyncio
            return await asyncio.get_event_loop().run_in_executor(
                None, lambda: model.encode(f"query: {text}", convert_to_numpy=True).tolist()
            )
        return _hash_embed(text)

    async def embed_passage(self, text: str) -> list[float]:
        model = _get_model()
        if model:
            import asyncio
            return await asyncio.get_event_loop().run_in_executor(
                None, lambda: model.encode(f"passage: {text}", convert_to_numpy=True).tolist()
            )
        return _hash_embed(text)
