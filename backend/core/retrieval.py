from __future__ import annotations
from dataclasses import dataclass
from config import settings
from core.enums import Role
from core.context import TenantContext


@dataclass
class RetrievedChunk:
    chunk_id: str
    document_id: str
    text: str
    similarity_score: float
    document_weight: float
    final_score: float
    metadata: dict


class QdrantRetrievalService:
    def __init__(self):
        self._client = None
        self._ready = False
        self._init()

    def _init(self):
        if not settings.qdrant_url:
            print("QDRANT_URL not set — vector search disabled")
            return
        try:
            from qdrant_client import AsyncQdrantClient
            key = settings.qdrant_api_key.get_secret_value() if settings.qdrant_api_key else None
            self._client = AsyncQdrantClient(url=settings.qdrant_url, api_key=key)
            self._ready = True
        except Exception as e:
            print(f"Qdrant init error: {e}")

    async def ensure_collection(self):
        if not self._ready: return
        try:
            from qdrant_client.http import models
            cols = await self._client.get_collections()
            if settings.qdrant_collection not in [c.name for c in cols.collections]:
                await self._client.create_collection(
                    collection_name=settings.qdrant_collection,
                    vectors_config=models.VectorParams(size=settings.embedding_dimension, distance=models.Distance.COSINE),
                )
        except Exception as e:
            print(f"Collection error: {e}")

    async def upsert_chunks(self, chunks: list[dict]) -> bool:
        if not self._ready: return False
        try:
            from qdrant_client.http import models
            await self.ensure_collection()
            points = [models.PointStruct(
                id=c["chunk_id"],
                vector=c["embedding"],
                payload={k: c[k] for k in ["chunk_id","document_id","document_name","chunk_text","page_number","chunk_index","org_id","classification","domain_id","uploaded_by","document_weight","freshness_tag"]}
            ) for c in chunks]
            await self._client.upsert(collection_name=settings.qdrant_collection, points=points)
            return True
        except Exception as e:
            print(f"Upsert error: {e}"); return False

    async def search(self, context: TenantContext, query_vector: list[float], *, limit: int = 8) -> list[RetrievedChunk]:
        if not self._ready or not self._client: return []
        try:
            from qdrant_client.http import models
            must = [
                models.FieldCondition(key="org_id", match=models.MatchValue(value=context.org_id)),
                models.FieldCondition(key="freshness_tag", match=models.MatchExcept(**{"except": ["expired"]})),
            ]

            if context.role == Role.ORG_SUPER_ADMIN:
                query_filter = models.Filter(must=must)
            else:
                should = [
                    models.FieldCondition(key="classification", match=models.MatchValue(value="public")),
                    models.Filter(must=[
                        models.FieldCondition(key="classification", match=models.MatchValue(value="confidential")),
                        models.FieldCondition(key="uploaded_by", match=models.MatchValue(value=context.user_id)),
                    ]),
                ]
                if context.domain_id:
                    should.append(models.Filter(must=[
                        models.FieldCondition(key="classification", match=models.MatchValue(value="internal")),
                        models.FieldCondition(key="domain_id", match=models.MatchValue(value=context.domain_id)),
                    ]))
                query_filter = models.Filter(must=must, should=should)

            response = await self._client.query_points(
                collection_name=settings.qdrant_collection,
                query=query_vector,
                query_filter=query_filter,
                limit=limit, with_payload=True,
            )
            chunks = []
            for p in response.points:
                pl = p.payload or {}
                w = float(pl.get("document_weight", 1.0))
                s = float(p.score)
                chunks.append(RetrievedChunk(chunk_id=str(pl.get("chunk_id", p.id)), document_id=str(pl.get("document_id","")),
                    text=str(pl.get("chunk_text","")), similarity_score=s, document_weight=w, final_score=s*w, metadata=pl))
            return sorted(chunks, key=lambda x: x.final_score, reverse=True)
        except Exception as e:
            print(f"Search error: {e}"); return []

    async def delete_document(self, org_id: str, document_id: str):
        if not self._ready: return
        try:
            from qdrant_client.http import models
            await self._client.delete(collection_name=settings.qdrant_collection,
                points_selector=models.FilterSelector(filter=models.Filter(must=[
                    models.FieldCondition(key="org_id", match=models.MatchValue(value=org_id)),
                    models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id)),
                ])))
        except Exception as e:
            print(f"Delete error: {e}")