import asyncio
from typing import Type

from pydantic import BaseModel

from app.schemas.transformation import (
    ActionItemsOutput,
    AdvisoryOutput,
    ContentAnalysis,
    DetailedSummaryOutput,
    ExecutiveSummaryOutput,
    InfographicOutput,
    LinkedInOutput,
    OutputType,
    PresentationOutput,
    StructuredDataOutput,
    TransformationRequest,
    VideoScriptOutput,
    XThreadOutput,
)
from app.services.ai.gemini_service import (
    gemini_service,
)
from app.services.ai.prompts import (
    build_generation_prompt,
)


OUTPUT_SCHEMAS: dict[
    OutputType,
    Type[BaseModel],
] = {
    OutputType.EXECUTIVE_SUMMARY: (
        ExecutiveSummaryOutput
    ),
    OutputType.DETAILED_SUMMARY: (
        DetailedSummaryOutput
    ),
    OutputType.ADVISORY: (
        AdvisoryOutput
    ),
    OutputType.LINKEDIN: (
        LinkedInOutput
    ),
    OutputType.X_THREAD: (
        XThreadOutput
    ),
    OutputType.INFOGRAPHIC: (
        InfographicOutput
    ),
    OutputType.PRESENTATION: (
        PresentationOutput
    ),
    OutputType.VIDEO_SCRIPT: (
        VideoScriptOutput
    ),
    OutputType.ACTION_ITEMS: (
        ActionItemsOutput
    ),
    OutputType.STRUCTURED_DATA: (
        StructuredDataOutput
    ),
}


class TransformationGenerator:

    def __init__(
        self,
        max_concurrency: int = 3,
    ) -> None:
        self.semaphore = (
            asyncio.Semaphore(
                max_concurrency
            )
        )

    async def _generate_one(
        self,
        output_type: OutputType,
        request: TransformationRequest,
        analysis: ContentAnalysis,
        rag_context: str,
    ) -> tuple[
        OutputType,
        BaseModel,
    ]:
        schema = OUTPUT_SCHEMAS[
            output_type
        ]

        prompt = build_generation_prompt(
            output_type=output_type,
            request=request,
            analysis=analysis,
            rag_context=rag_context,
        )

        async with self.semaphore:
            result = await (
                gemini_service
                .generate_structured(
                    prompt,
                    schema,
                )
            )

        return (
            output_type,
            result,
        )

    async def generate(
        self,
        request: TransformationRequest,
        analysis: ContentAnalysis,
        rag_context: str,
    ) -> dict[
        OutputType,
        BaseModel,
    ]:
        tasks = [
            self._generate_one(
                output_type,
                request,
                analysis,
                rag_context,
            )
            for output_type
            in request.selected_outputs
        ]

        results = await asyncio.gather(
            *tasks
        )

        return {
            output_type: output
            for output_type, output
            in results
        }


transformation_generator = (
    TransformationGenerator()
)