from __future__ import annotations

import asyncio
import logging

from typing import (
    TypeVar,
)

from google import (
    genai,
)

from pydantic import (
    BaseModel,
)

from tenacity import (
    AsyncRetrying,
    before_sleep_log,
    stop_after_attempt,
    wait_exponential_jitter,
)

from app.core.config import (
    settings,
)


logger = logging.getLogger(
    __name__
)


SchemaT = TypeVar(
    "SchemaT",
    bound=BaseModel,
)


class StructuredGenerationError(
    RuntimeError
):
    pass


class StructuredGeminiService:

    def __init__(
        self,
    ) -> None:

        self._client: (
            genai.Client | None
        ) = None


    def _get_client(
        self,
    ) -> genai.Client:

        if self._client is None:

            api_key = (
                settings.gemini_api_key
            )

            if not api_key:

                raise (
                    StructuredGenerationError(
                        "GEMINI_API_KEY "
                        "is not configured."
                    )
                )


            self._client = (
                genai.Client(
                    api_key=(
                        api_key
                    )
                )
            )


        return self._client


    async def generate_structured(
        self,
        *,
        input_text: str,
        response_schema: type[
            SchemaT
        ],
        system_instruction: str,
        temperature: float = 0.15,
        model: str | None = None,
        max_attempts: int = 3,
    ) -> SchemaT:

        selected_model = (
            model
            or settings.gemini_model
        )


        async for attempt in (
            AsyncRetrying(
                stop=(
                    stop_after_attempt(
                        max_attempts
                    )
                ),

                wait=(
                    wait_exponential_jitter(
                        initial=1,
                        max=8,
                        jitter=1,
                    )
                ),

                before_sleep=(
                    before_sleep_log(
                        logger,
                        logging.WARNING,
                    )
                ),

                reraise=True,
            )
        ):

            with attempt:

                client = (
                    self._get_client()
                )


                interaction = (
                    await asyncio.to_thread(
                        client.interactions.create,

                        model=(
                            selected_model
                        ),

                        input=(
                            input_text
                        ),

                        system_instruction=(
                            system_instruction
                        ),

                        generation_config={
                            "temperature":
                                temperature,
                        },

                        response_format={
                            "type":
                                "text",

                            "mime_type":
                                "application/json",

                            "schema":
                                response_schema
                                .model_json_schema(),
                        },

                        # Document analysis is stateless.
                        # We intentionally do not retain
                        # Interaction resources.
                        store=False,
                    )
                )


                output_text = (
                    interaction.output_text
                )


                if not output_text:

                    raise (
                        StructuredGenerationError(
                            "Gemini returned "
                            "an empty response."
                        )
                    )


                try:

                    return (
                        response_schema
                        .model_validate_json(
                            output_text
                        )
                    )


                except Exception as exc:

                    logger.warning(
                        (
                            "structured_output_"
                            "validation_failed "
                            "model=%s"
                        ),
                        selected_model,
                    )


                    raise (
                        StructuredGenerationError(
                            "Gemini response "
                            "did not satisfy "
                            "the required schema."
                        )
                    ) from exc


        raise StructuredGenerationError(
            "Structured generation failed."
        )


structured_gemini_service = (
    StructuredGeminiService()
)