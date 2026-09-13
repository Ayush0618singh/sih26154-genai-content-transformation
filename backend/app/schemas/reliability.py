from __future__ import annotations

from typing import (
    Any,
)

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class EvidenceCandidate(
    BaseModel
):
    model_config = (
        ConfigDict(
            extra="forbid"
        )
    )

    claim: str = Field(
        min_length=1,
        max_length=800,
    )

    supporting_text: str = Field(
        min_length=1,
        max_length=1200,
    )

    category: str = Field(
        default="fact",
        max_length=100,
    )

    importance: int = Field(
        default=3,
        ge=1,
        le=5,
    )


class ChunkAnalysis(
    BaseModel
):
    model_config = (
        ConfigDict(
            extra="forbid"
        )
    )

    summary: str = Field(
        min_length=1
    )

    topics: list[str] = Field(
        default_factory=list
    )

    entities: list[str] = Field(
        default_factory=list
    )

    critical_facts: list[str] = Field(
        default_factory=list
    )

    metrics: list[str] = Field(
        default_factory=list
    )

    risks: list[str] = Field(
        default_factory=list
    )

    opportunities: list[str] = Field(
        default_factory=list
    )

    recommended_actions: list[str] = Field(
        default_factory=list
    )

    evidence: list[
        EvidenceCandidate
    ] = Field(
        default_factory=list
    )


class SynthesisDraft(
    BaseModel
):
    model_config = (
        ConfigDict(
            extra="forbid"
        )
    )

    one_line_summary: str = Field(
        min_length=1
    )

    executive_context: str = Field(
        min_length=1
    )

    key_topics: list[str] = Field(
        default_factory=list
    )

    key_entities: list[str] = Field(
        default_factory=list
    )

    critical_facts: list[str] = Field(
        default_factory=list
    )

    metrics: list[str] = Field(
        default_factory=list
    )

    risks: list[str] = Field(
        default_factory=list
    )

    opportunities: list[str] = Field(
        default_factory=list
    )

    recommended_actions: list[str] = Field(
        default_factory=list
    )


class EvidenceReference(
    BaseModel
):
    model_config = (
        ConfigDict(
            extra="forbid"
        )
    )

    claim: str

    supporting_text: str

    category: str

    importance: int = Field(
        ge=1,
        le=5,
    )

    verified: bool

    chunk_index: int = Field(
        ge=0
    )

    source_start_char: (
        int | None
    ) = Field(
        default=None,
        ge=0,
    )

    source_end_char: (
        int | None
    ) = Field(
        default=None,
        ge=0,
    )

    page_start: (
        int | None
    ) = Field(
        default=None,
        ge=1,
    )

    page_end: (
        int | None
    ) = Field(
        default=None,
        ge=1,
    )


class CoverageMetadata(
    BaseModel
):
    total_source_characters: int = Field(
        ge=0
    )

    total_chunks: int = Field(
        ge=0
    )

    analyzed_chunks: int = Field(
        ge=0
    )

    failed_chunks: int = Field(
        ge=0
    )

    coverage_ratio: float = Field(
        ge=0.0,
        le=1.0,
    )

    sampling_used: bool = False

    strategy: str = (
        "hierarchical_map_reduce"
    )


class ConfidenceMetadata(
    BaseModel
):
    overall: float = Field(
        ge=0.0,
        le=1.0,
    )

    coverage: float = Field(
        ge=0.0,
        le=1.0,
    )

    evidence_verification: float = Field(
        ge=0.0,
        le=1.0,
    )

    source_quality: float = Field(
        ge=0.0,
        le=1.0,
    )

    label: str

    rationale: list[str] = Field(
        default_factory=list
    )


class ReliableDocumentAnalysis(
    BaseModel
):
    one_line_summary: str

    executive_context: str

    key_topics: list[str] = Field(
        default_factory=list
    )

    key_entities: list[str] = Field(
        default_factory=list
    )

    critical_facts: list[str] = Field(
        default_factory=list
    )

    metrics: list[str] = Field(
        default_factory=list
    )

    risks: list[str] = Field(
        default_factory=list
    )

    opportunities: list[str] = Field(
        default_factory=list
    )

    recommended_actions: list[str] = Field(
        default_factory=list
    )

    evidence: list[
        EvidenceReference
    ] = Field(
        default_factory=list
    )

    coverage: CoverageMetadata

    confidence: ConfidenceMetadata

    prompt_versions: dict[
        str,
        str,
    ] = Field(
        default_factory=dict
    )

    model: str

    metadata: dict[
        str,
        Any,
    ] = Field(
        default_factory=dict
    )