from enum import StrEnum
from uuid import UUID

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)

from app.schemas.transformation import (
    OutputType,
)


class ExportFormat(StrEnum):
    PDF = "pdf"
    DOCX = "docx"
    PPTX = "pptx"
    JSON = "json"
    CSV = "csv"
    SRT = "srt"


class ExportRequest(BaseModel):
    formats: list[ExportFormat] = Field(
        min_length=1,
        max_length=6,
    )

    include_output_types: (
        list[OutputType] | None
    ) = None

    @field_validator("formats")
    @classmethod
    def remove_duplicate_formats(
        cls,
        value: list[ExportFormat],
    ) -> list[ExportFormat]:

        return list(
            dict.fromkeys(value)
        )

    @field_validator(
        "include_output_types"
    )
    @classmethod
    def remove_duplicate_output_types(
        cls,
        value: list[OutputType] | None,
    ) -> list[OutputType] | None:

        if value is None:
            return None

        return list(
            dict.fromkeys(value)
        )


class ExportArtifact(BaseModel):
    id: UUID

    transformation_id: UUID

    export_format: ExportFormat

    filename: str

    mime_type: str

    file_size: int = Field(
        ge=0
    )

    storage_path: str

    signed_url: str | None = None

    expires_in: int | None = None


class ExportBatchResponse(BaseModel):
    transformation_id: UUID

    artifacts: list[
        ExportArtifact
    ] = Field(
        default_factory=list
    )


class ExportListResponse(BaseModel):
    transformation_id: UUID

    artifacts: list[
        ExportArtifact
    ] = Field(
        default_factory=list
    )


class SignedDownloadResponse(BaseModel):
    export_id: UUID

    filename: str

    signed_url: str

    expires_in: int