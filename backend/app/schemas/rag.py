from __future__ import annotations

from typing import Any

from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# ============================================================
# Legacy / local Chroma compatibility
#
# Production RAG uses Supabase pgvector.
# This model is retained only so older local Chroma utilities
# and cleanup paths continue to import safely.
# ============================================================


class RetrievedChunk(
    BaseModel
):
    model_config = ConfigDict(
        extra="allow",
    )

    id: str | None = None

    document_id: (
        UUID
        | str
        | None
    ) = None

    source_document_id: (
        UUID
        | str
        | None
    ) = None

    chunk_index: int = Field(
        default=0,
        ge=0,
    )

    text: str = ""

    content: str = ""

    distance: float | None = None

    similarity: float | None = None

    metadata: dict[
        str,
        Any,
    ] = Field(
        default_factory=dict,
    )


# ============================================================
# Production pgvector API schemas
# ============================================================


class RagIndexResponse(
    BaseModel
):
    model_config = ConfigDict(
        extra="forbid",
    )

    document_id: UUID

    status: str

    chunk_count: int = Field(
        ge=0,
    )

    provider: str = (
        "supabase_pgvector"
    )

    embedding_model: str

    embedding_dimensions: int = Field(
        ge=1,
    )


class RagQueryRequest(
    BaseModel
):
    model_config = ConfigDict(
        extra="forbid",
    )

    query: str = Field(
        min_length=2,
        max_length=4000,
    )

    document_id: UUID | None = None

    top_k: int | None = Field(
        default=None,
        ge=1,
        le=50,
    )

    min_similarity: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )


class RagSearchResult(
    BaseModel
):
    model_config = ConfigDict(
        extra="forbid",
    )

    id: UUID

    source_document_id: UUID

    chunk_index: int = Field(
        ge=0,
    )

    content: str

    similarity: float

    metadata: dict[
        str,
        Any,
    ] = Field(
        default_factory=dict,
    )


class RagQueryResponse(
    BaseModel
):
    model_config = ConfigDict(
        extra="forbid",
    )

    query: str

    document_id: UUID | None

    result_count: int = Field(
        ge=0,
    )

    results: list[
        RagSearchResult
    ] = Field(
        default_factory=list,
    )