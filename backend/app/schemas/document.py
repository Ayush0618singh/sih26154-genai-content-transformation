from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ExtractedPage(BaseModel):
    page_number: int = Field(
        ge=1
    )

    text: str

    character_count: int = Field(
        ge=0
    )

    used_ocr: bool = False


class DocumentExtractionResult(BaseModel):
    filename: str

    document_type: str

    mime_type: str

    extraction_method: str

    page_count: int = Field(
        ge=0
    )

    character_count: int = Field(
        ge=0
    )

    text: str

    pages: list[ExtractedPage] = []

    metadata: dict[str, Any] = {}


class DocumentUploadResponse(BaseModel):
    document_id: UUID

    filename: str

    input_type: str

    mime_type: str

    file_size: int

    status: str

    storage_path: str

    extraction_method: str

    page_count: int

    character_count: int

    text_preview: str

    metadata: dict[str, Any]