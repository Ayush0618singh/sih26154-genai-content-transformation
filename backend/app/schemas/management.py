from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import (
    BaseModel,
    Field,
)


# ============================================================
# Common
# ============================================================


class PaginationMeta(BaseModel):
    page: int = Field(
        ge=1
    )

    page_size: int = Field(
        ge=1
    )

    total: int = Field(
        ge=0
    )

    total_pages: int = Field(
        ge=0
    )


class DeleteResponse(BaseModel):
    id: UUID
    status: str
    message: str


# ============================================================
# Direct Text Input
# ============================================================


class TextDocumentCreateRequest(BaseModel):
    title: str = Field(
        min_length=2,
        max_length=180,
    )

    content: str = Field(
        min_length=1,
        max_length=2_000_000,
    )

    language: str = Field(
        default="auto",
        max_length=50,
    )


# ============================================================
# Documents
# ============================================================


class DocumentListItem(BaseModel):
    id: UUID

    original_filename: str

    mime_type: str

    file_size: int

    input_type: str

    status: str

    extraction_method: (
        str | None
    ) = None

    page_count: int

    character_count: int

    created_at: datetime

    updated_at: datetime


class DocumentListResponse(BaseModel):
    items: list[
        DocumentListItem
    ] = Field(
        default_factory=list
    )

    pagination: PaginationMeta


class DocumentDetailResponse(BaseModel):
    id: UUID

    original_filename: str

    mime_type: str

    file_size: int

    input_type: str

    storage_path: (
        str | None
    ) = None

    status: str

    extraction_method: (
        str | None
    ) = None

    page_count: int

    character_count: int

    extracted_text: (
        str | None
    ) = None

    metadata: dict[
        str,
        Any,
    ] = Field(
        default_factory=dict
    )

    error_message: (
        str | None
    ) = None

    rag_status: (
        str | None
    ) = None

    rag_chunk_count: int = 0

    transformation_count: int = 0

    created_at: datetime

    updated_at: datetime


# ============================================================
# Transformations
# ============================================================


class TransformationListItem(BaseModel):
    id: UUID

    source_document_id: (
        UUID | None
    ) = None

    title: (
        str | None
    ) = None

    status: str

    target_audience: (
        str | None
    ) = None

    tone: (
        str | None
    ) = None

    language: str

    detail_level: (
        str | None
    ) = None

    objective: (
        str | None
    ) = None

    selected_outputs: list[
        str
    ] = Field(
        default_factory=list
    )

    output_count: int = 0

    created_at: datetime

    updated_at: datetime


class TransformationListResponse(
    BaseModel
):
    items: list[
        TransformationListItem
    ] = Field(
        default_factory=list
    )

    pagination: PaginationMeta


# ============================================================
# Activity
# ============================================================


class ActivityEventItem(BaseModel):
    id: UUID

    event_type: str

    source_document_id: (
        UUID | None
    ) = None

    transformation_id: (
        UUID | None
    ) = None

    metadata: dict[
        str,
        Any,
    ] = Field(
        default_factory=dict
    )

    created_at: datetime


class ActivityListResponse(BaseModel):
    items: list[
        ActivityEventItem
    ] = Field(
        default_factory=list
    )

    pagination: PaginationMeta


# ============================================================
# Dashboard / Analytics
# ============================================================


class DistributionItem(BaseModel):
    label: str
    count: int


class TimelinePoint(BaseModel):
    date: str

    documents: int = 0

    transformations: int = 0

    exports: int = 0


class DashboardOverviewResponse(
    BaseModel
):
    total_documents: int

    total_transformations: int

    total_generated_outputs: int

    total_exports: int

    completed_transformations: int

    failed_transformations: int

    success_rate: float

    total_storage_bytes: int

    recent_documents: list[
        DocumentListItem
    ] = Field(
        default_factory=list
    )

    recent_transformations: list[
        TransformationListItem
    ] = Field(
        default_factory=list
    )

    recent_activity: list[
        ActivityEventItem
    ] = Field(
        default_factory=list
    )


class AnalyticsResponse(BaseModel):
    days: int

    input_type_distribution: list[
        DistributionItem
    ] = Field(
        default_factory=list
    )

    output_type_distribution: list[
        DistributionItem
    ] = Field(
        default_factory=list
    )

    transformation_status_distribution: list[
        DistributionItem
    ] = Field(
        default_factory=list
    )

    timeline: list[
        TimelinePoint
    ] = Field(
        default_factory=list
    )


# ============================================================
# Profile
# ============================================================


class ProfileResponse(BaseModel):
    id: UUID

    email: (
        str | None
    ) = None

    full_name: (
        str | None
    ) = None

    avatar_url: (
        str | None
    ) = None

    role: str

    created_at: (
        datetime | None
    ) = None

    updated_at: (
        datetime | None
    ) = None


class ProfileUpdateRequest(BaseModel):
    full_name: (
        str | None
    ) = Field(
        default=None,
        max_length=150,
    )

    avatar_url: (
        str | None
    ) = Field(
        default=None,
        max_length=2000,
    )