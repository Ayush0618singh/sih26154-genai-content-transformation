from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


# ============================================================
# Supported output types
# ============================================================


class OutputType(StrEnum):
    EXECUTIVE_SUMMARY = "executive_summary"
    DETAILED_SUMMARY = "detailed_summary"
    ADVISORY = "advisory"
    LINKEDIN = "linkedin"
    X_THREAD = "x_thread"
    INFOGRAPHIC = "infographic"
    PRESENTATION = "presentation"
    VIDEO_SCRIPT = "video_script"
    ACTION_ITEMS = "action_items"
    STRUCTURED_DATA = "structured_data"


# ============================================================
# Content Intelligence
# ============================================================


class AnalysisEntity(BaseModel):
    name: str
    entity_type: str
    relevance: str


class AnalysisMetric(BaseModel):
    name: str
    value: str
    context: str


class AnalysisFact(BaseModel):
    statement: str
    importance: Literal[
        "low",
        "medium",
        "high",
        "critical",
    ]


class ContentAnalysis(BaseModel):
    inferred_title: str

    content_type: str

    one_line_summary: str

    executive_context: str

    key_topics: list[str] = Field(
        default_factory=list
    )

    key_facts: list[AnalysisFact] = Field(
        default_factory=list
    )

    entities: list[AnalysisEntity] = Field(
        default_factory=list
    )

    metrics: list[AnalysisMetric] = Field(
        default_factory=list
    )

    stakeholders: list[str] = Field(
        default_factory=list
    )

    risks: list[str] = Field(
        default_factory=list
    )

    opportunities: list[str] = Field(
        default_factory=list
    )

    important_questions: list[str] = Field(
        default_factory=list
    )

    recommended_audiences: list[str] = Field(
        default_factory=list
    )

    source_quality_notes: list[str] = Field(
        default_factory=list
    )

    @field_validator(
        "metrics",
        mode="before",
    )
    @classmethod
    def normalize_metrics(
        cls,
        value,
    ):
        if value is None:
            return []

        normalized = []

        for item in value:
            if isinstance(
                item,
                AnalysisMetric,
            ):
                normalized.append(
                    item
                )
                continue

            if isinstance(
                item,
                dict,
            ):
                normalized.append(
                    item
                )
                continue

            if isinstance(
                item,
                str,
            ):
                text = item.strip()

                if not text:
                    continue

                if ":" in text:
                    name, metric_value = (
                        text.split(
                            ":",
                            1,
                        )
                    )

                    normalized.append(
                        {
                            "name": (
                                name.strip()
                                or "Metric"
                            ),
                            "value": (
                                metric_value.strip()
                            ),
                            "context": (
                                "Extracted from "
                                "source analysis."
                            ),
                        }
                    )

                else:
                    normalized.append(
                        {
                            "name": "Metric",
                            "value": text,
                            "context": (
                                "Extracted from "
                                "source analysis."
                            ),
                        }
                    )

                continue

            normalized.append(
                {
                    "name": "Metric",
                    "value": str(item),
                    "context": (
                        "Extracted from "
                        "source analysis."
                    ),
                }
            )

        return normalized


class ChunkDigest(BaseModel):
    summary: str

    key_points: list[str] = Field(
        default_factory=list
    )

    facts: list[str] = Field(
        default_factory=list
    )

    entities: list[str] = Field(
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


# ============================================================
# Output Models
# ============================================================


class ExecutiveSummaryOutput(BaseModel):
    title: str
    summary: str

    key_points: list[str] = Field(
        default_factory=list
    )

    key_takeaway: str


class ContentSection(BaseModel):
    heading: str
    content: str

    key_points: list[str] = Field(
        default_factory=list
    )


class DetailedSummaryOutput(BaseModel):
    title: str
    overview: str

    sections: list[ContentSection] = Field(
        default_factory=list
    )

    conclusion: str


class AdvisoryRecommendation(BaseModel):
    title: str
    recommendation: str
    rationale: str

    priority: Literal[
        "low",
        "medium",
        "high",
        "critical",
    ]


class AdvisoryOutput(BaseModel):
    title: str

    situation_overview: str

    recommendations: list[
        AdvisoryRecommendation
    ] = Field(
        default_factory=list
    )

    risks_and_cautions: list[str] = Field(
        default_factory=list
    )

    next_steps: list[str] = Field(
        default_factory=list
    )


class LinkedInOutput(BaseModel):
    post: str

    hashtags: list[str] = Field(
        default_factory=list
    )


class XThreadOutput(BaseModel):
    hook: str

    posts: list[str] = Field(
        default_factory=list
    )

    hashtags: list[str] = Field(
        default_factory=list
    )


class InfographicSection(BaseModel):
    heading: str
    primary_text: str

    supporting_points: list[str] = Field(
        default_factory=list
    )

    suggested_visual: str


class InfographicOutput(BaseModel):
    title: str
    subtitle: str

    sections: list[
        InfographicSection
    ] = Field(
        default_factory=list
    )

    visual_direction: str

    footer_text: str


class PresentationSlide(BaseModel):
    slide_number: int = Field(
        ge=1
    )

    title: str

    bullets: list[str] = Field(
        default_factory=list
    )

    speaker_notes: str

    visual_suggestion: str


class PresentationOutput(BaseModel):
    title: str
    subtitle: str

    slides: list[
        PresentationSlide
    ] = Field(
        default_factory=list
    )

    closing_message: str


class VideoScene(BaseModel):
    scene_number: int = Field(
        ge=1
    )

    duration_seconds: int = Field(
        ge=1
    )

    visual_description: str

    voiceover: str

    on_screen_text: str


class VideoScriptOutput(BaseModel):
    title: str

    estimated_duration_seconds: int = Field(
        ge=1
    )

    opening_hook: str

    scenes: list[
        VideoScene
    ] = Field(
        default_factory=list
    )

    closing_cta: str


class ActionItem(BaseModel):
    action: str

    owner_role: str

    priority: Literal[
        "low",
        "medium",
        "high",
        "critical",
    ]

    expected_outcome: str


class ActionItemsOutput(BaseModel):
    summary: str

    items: list[
        ActionItem
    ] = Field(
        default_factory=list
    )


class StructuredField(BaseModel):
    key: str
    value: str
    category: str
    source_context: str


class StructuredDataOutput(BaseModel):
    fields: list[
        StructuredField
    ] = Field(
        default_factory=list
    )


# ============================================================
# Transformation request / response
# ============================================================


class TransformationRequest(BaseModel):
    document_id: UUID

    target_audience: str = Field(
        min_length=2,
        max_length=200,
    )

    tone: str = Field(
        default="Professional",
        min_length=2,
        max_length=100,
    )

    language: str = Field(
        default="English",
        min_length=2,
        max_length=100,
    )

    detail_level: Literal[
        "concise",
        "balanced",
        "detailed",
    ] = "balanced"

    objective: str = Field(
        min_length=2,
        max_length=500,
    )

    selected_outputs: list[
        OutputType
    ] = Field(
        min_length=1,
        max_length=10,
    )

    custom_instructions: str = Field(
        default="",
        max_length=2000,
    )

    use_rag: bool = True

    @field_validator(
        "selected_outputs"
    )
    @classmethod
    def remove_duplicate_outputs(
        cls,
        value: list[OutputType],
    ) -> list[OutputType]:
        return list(
            dict.fromkeys(value)
        )


class GeneratedOutputRecord(BaseModel):
    id: UUID

    output_type: OutputType

    title: str | None = None

    content: dict


class TransformationResponse(BaseModel):
    transformation_id: UUID

    document_id: UUID

    status: str

    analysis: ContentAnalysis

    outputs: list[
        GeneratedOutputRecord
    ] = Field(
        default_factory=list
    )


class TransformationDetailResponse(
    BaseModel
):
    transformation_id: UUID

    document_id: UUID | None

    title: str | None

    status: str

    target_audience: str | None
    tone: str | None
    language: str
    detail_level: str | None
    objective: str | None

    selected_outputs: list[str]

    analysis: dict

    outputs: list[dict] = Field(
        default_factory=list
    )