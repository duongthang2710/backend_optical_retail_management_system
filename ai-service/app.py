from typing import Any, Dict, List

import numpy as np
from fastapi import FastAPI, HTTPException
from FlagEmbedding import BGEM3FlagModel, FlagReranker
from pydantic import BaseModel, Field


EMBEDDING_MODEL_NAME = "BAAI/bge-m3"
RERANKER_MODEL_NAME = "BAAI/bge-reranker-v2-m3"

app = FastAPI(title="Optical RAG Chatbot AI Service", version="1.0.0")

print(f"[AI Service] Loading embedding model: {EMBEDDING_MODEL_NAME}")
# Change use_fp16=True if the deployment machine has a compatible NVIDIA GPU.
embedding_model = BGEM3FlagModel(EMBEDDING_MODEL_NAME, use_fp16=False)

print(f"[AI Service] Loading reranker model: {RERANKER_MODEL_NAME}")
reranker_model = FlagReranker(RERANKER_MODEL_NAME, use_fp16=False)


class EmbedRequest(BaseModel):
    texts: List[str] = Field(default_factory=list)
    max_length: int = 1024


class RerankDocument(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RerankRequest(BaseModel):
    query: str
    top_n: int = 5
    documents: List[RerankDocument] = Field(default_factory=list)


def normalize_vectors(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


@app.get("/health")
def health():
    return {
        "status": "ok",
        "embedding_model": EMBEDDING_MODEL_NAME,
        "reranker_model": RERANKER_MODEL_NAME,
    }


@app.post("/embed")
def embed(request: EmbedRequest):
    if not request.texts:
        return {"count": 0, "dimension": 1024, "vectors": []}

    try:
        output = embedding_model.encode(
            request.texts,
            max_length=request.max_length,
            return_dense=True,
            return_sparse=False,
            return_colbert_vecs=False,
        )
        vectors = np.array(output["dense_vecs"], dtype=np.float32)
        vectors = normalize_vectors(vectors)

        return {
            "count": len(request.texts),
            "dimension": int(vectors.shape[1]) if vectors.ndim == 2 else 0,
            "vectors": vectors.tolist(),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {exc}") from exc


@app.post("/rerank")
def rerank(request: RerankRequest):
    if not request.documents:
        return {"query": request.query, "top_n": request.top_n, "results": []}

    try:
        pairs = [[request.query, document.content] for document in request.documents]
        scores = reranker_model.compute_score(pairs, normalize=True)
        if not isinstance(scores, list):
            scores = [float(scores)]

        ranked = []
        for document, score in zip(request.documents, scores):
            ranked.append(
                {
                    "id": document.id,
                    "content": document.content,
                    "metadata": document.metadata,
                    "rerank_score": float(score),
                }
            )

        ranked.sort(key=lambda item: item["rerank_score"], reverse=True)
        top_n = max(0, request.top_n)

        return {
            "query": request.query,
            "top_n": request.top_n,
            "results": ranked[:top_n],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Rerank failed: {exc}") from exc
