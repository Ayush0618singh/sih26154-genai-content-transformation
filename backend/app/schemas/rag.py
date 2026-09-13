from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class RAGIndexResponse(BaseModel):
    document_id: UUID

    collection_name: str

    chunk_count: int

    status: str


class RAGQueryRequest(BaseModel):
    document_id: UUID

    query: str = Field(
        min_length=2,
        max_length=2000,
    )

    top_k: int = Field(
        default=6,
        ge=1,
        le=20,
    )


class RetrievedChunk(BaseModel):
    chunk_id: str

    text: str

    distance: float | None = None

    metadata: dict[str, Any] = Field(
        default_factory=dict
    )


class RAGQueryResponse(BaseModel):
    document_id: UUID

    query: str

    chunks: list[
        RetrievedChunk
    ] = Field(
        default_factory=list
    )