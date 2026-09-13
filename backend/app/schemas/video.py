from __future__ import annotations

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class VideoTranscriptSegment(
    BaseModel
):
    model_config = ConfigDict(
        extra="forbid"
    )

    start_seconds: float = Field(
        ge=0
    )

    end_seconds: float = Field(
        ge=0
    )

    speaker: str | None = Field(
        default=None,
        max_length=150,
    )

    text: str = Field(
        min_length=1
    )


class VideoScene(
    BaseModel
):
    model_config = ConfigDict(
        extra="forbid"
    )

    start_seconds: float = Field(
        ge=0
    )

    end_seconds: float = Field(
        ge=0
    )

    description: str = Field(
        min_length=1
    )

    important_visuals: list[str] = Field(
        default_factory=list
    )

    on_screen_text: list[str] = Field(
        default_factory=list
    )


class VideoUnderstandingResult(
    BaseModel
):
    model_config = ConfigDict(
        extra="forbid"
    )

    title: str | None = None

    summary: str = Field(
        min_length=1
    )

    detected_language: str = Field(
        default="unknown"
    )

    key_points: list[str] = Field(
        default_factory=list
    )

    entities: list[str] = Field(
        default_factory=list
    )

    topics: list[str] = Field(
        default_factory=list
    )

    transcript_segments: list[
        VideoTranscriptSegment
    ] = Field(
        default_factory=list
    )

    scenes: list[
        VideoScene
    ] = Field(
        default_factory=list
    )

    visual_observations: list[str] = Field(
        default_factory=list
    )

    audio_observations: list[str] = Field(
        default_factory=list
    )

    on_screen_text: list[str] = Field(
        default_factory=list
    )


class VideoExtractionResult(
    BaseModel
):
    text: str

    extraction_method: str = (
        "gemini_video_understanding"
    )

    page_count: int = Field(
        default=0,
        ge=0,
    )

    character_count: int = Field(
        ge=0
    )

    metadata: dict = Field(
        default_factory=dict
    )