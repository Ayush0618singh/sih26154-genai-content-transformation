from __future__ import annotations

import asyncio
import logging

from typing import (
    TypeVar,
)

from google import (
    genai,
)

from google.genai import (
    errors as genai_errors,
)

from pydantic import (
    BaseModel,
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


# ============================================================
# Public service exceptions
# ============================================================


class StructuredGenerationError(
    RuntimeError
):
    """
    Base exception exposed by the structured Gemini service.

    Raw provider errors should not leak to API/frontend users.
    """
    pass


class GeminiRateLimitError(
    StructuredGenerationError
):
    """
    Raised when Gemini returns HTTP 429 / RESOURCE_EXHAUSTED.
    """
    pass


class GeminiServiceUnavailableError(
    StructuredGenerationError
):
    """
    Raised when Gemini is temporarily unavailable after retries.
    """
    pass


# ============================================================
# Structured Gemini service
# ============================================================


class StructuredGeminiService:

    # Provider failures that are generally safe to retry.
    _TRANSIENT_STATUS_CODES = {
        500,
        502,
        503,
        504,
    }

    def __init__(
        self,
    ) -> None:

        self._client: (
            genai.Client | None
        ) = None


    # --------------------------------------------------------
    # Client
    # --------------------------------------------------------

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
                        "AI service is not configured."
                    )
                )

            self._client = (
                genai.Client(
                    api_key=api_key
                )
            )

        return self._client


    # --------------------------------------------------------
    # Provider error helpers
    # --------------------------------------------------------

    @staticmethod
    def _get_status_code(
        exc: BaseException,
    ) -> int | None:

        for attribute in (
            "code",
            "status_code",
            "status",
        ):

            value = getattr(
                exc,
                attribute,
                None,
            )

            if isinstance(
                value,
                int,
            ):

                return value

            if isinstance(
                value,
                str,
            ):

                try:

                    return int(
                        value
                    )

                except ValueError:

                    pass

        return None


    @staticmethod
    def _is_rate_limit_error(
        exc: BaseException,
    ) -> bool:

        status_code = (
            StructuredGeminiService
            ._get_status_code(
                exc
            )
        )

        if status_code == 429:

            return True

        message = str(
            exc
        ).upper()

        return (
            "RESOURCE_EXHAUSTED"
            in message
            or
            "RATE_LIMIT"
            in message
            or
            "TOO_MANY_REQUESTS"
            in message
        )


    @classmethod
    def _is_transient_provider_error(
        cls,
        exc: BaseException,
    ) -> bool:

        status_code = (
            cls._get_status_code(
                exc
            )
        )

        return (
            status_code
            in cls._TRANSIENT_STATUS_CODES
        )


    @staticmethod
    async def _retry_delay(
        attempt_number: int,
    ) -> None:

        # Small bounded exponential backoff.
        #
        # attempt 1 -> 2 sec
        # attempt 2 -> 4 sec
        # attempt 3 -> 8 sec
        #
        # 429 is intentionally NOT retried here because
        # it may represent exhausted project/day quota.

        delay_seconds = min(
            2 ** attempt_number,
            8,
        )

        await asyncio.sleep(
            delay_seconds
        )


    # --------------------------------------------------------
    # Single provider request
    # --------------------------------------------------------

    async def _create_interaction(
        self,
        *,
        input_text: str,
        response_schema: type[
            SchemaT
        ],
        system_instruction: str,
        temperature: float,
        selected_model: str,
    ) -> str:

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

                # Analysis/transformation calls are stateless.
                # Do not retain Interaction resources.
                store=False,
            )
        )

        output_text = (
            interaction.output_text
        )

        if not output_text:

            raise (
                StructuredGenerationError(
                    "AI service returned "
                    "an empty response."
                )
            )

        return output_text


    # --------------------------------------------------------
    # Public structured generation
    # --------------------------------------------------------

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

        if max_attempts < 1:

            max_attempts = 1

        last_error: (
            BaseException | None
        ) = None

        for attempt_number in range(
            1,
            max_attempts + 1,
        ):

            try:

                output_text = (
                    await self._create_interaction(
                        input_text=(
                            input_text
                        ),
                        response_schema=(
                            response_schema
                        ),
                        system_instruction=(
                            system_instruction
                        ),
                        temperature=(
                            temperature
                        ),
                        selected_model=(
                            selected_model
                        ),
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

                    last_error = exc

                    logger.warning(
                        (
                            "structured_output_"
                            "validation_failed "
                            "model=%s "
                            "attempt=%s/%s"
                        ),
                        selected_model,
                        attempt_number,
                        max_attempts,
                    )

                    if (
                        attempt_number
                        >= max_attempts
                    ):

                        raise (
                            StructuredGenerationError(
                                "AI response could not "
                                "be validated against "
                                "the required structure."
                            )
                        ) from exc

                    await (
                        self._retry_delay(
                            attempt_number
                        )
                    )

                    continue

            except (
                GeminiRateLimitError,
                GeminiServiceUnavailableError,
                StructuredGenerationError,
            ):

                raise

            except genai_errors.APIError as exc:

                last_error = exc

                # --------------------------------------------
                # 429 / quota / rate limit
                #
                # Do NOT rapidly retry.
                # --------------------------------------------

                if (
                    self._is_rate_limit_error(
                        exc
                    )
                ):

                    logger.warning(
                        (
                            "gemini_rate_limited "
                            "model=%s "
                            "status=%s"
                        ),
                        selected_model,
                        self._get_status_code(
                            exc
                        ),
                    )

                    raise (
                        GeminiRateLimitError(
                            "AI service is temporarily "
                            "rate limited. Please try "
                            "again shortly."
                        )
                    ) from exc

                # --------------------------------------------
                # Temporary Gemini/server errors
                # --------------------------------------------

                if (
                    self
                    ._is_transient_provider_error(
                        exc
                    )
                ):

                    logger.warning(
                        (
                            "gemini_transient_error "
                            "model=%s "
                            "status=%s "
                            "attempt=%s/%s"
                        ),
                        selected_model,
                        self._get_status_code(
                            exc
                        ),
                        attempt_number,
                        max_attempts,
                    )

                    if (
                        attempt_number
                        >= max_attempts
                    ):

                        raise (
                            GeminiServiceUnavailableError(
                                "AI service is temporarily "
                                "unavailable. Please try "
                                "again shortly."
                            )
                        ) from exc

                    await (
                        self._retry_delay(
                            attempt_number
                        )
                    )

                    continue

                # --------------------------------------------
                # Non-retryable Gemini API errors
                # --------------------------------------------

                logger.exception(
                    (
                        "gemini_api_error "
                        "model=%s "
                        "status=%s"
                    ),
                    selected_model,
                    self._get_status_code(
                        exc
                    ),
                )

                raise (
                    StructuredGenerationError(
                        "AI service could not process "
                        "the request."
                    )
                ) from exc

            except Exception as exc:

                last_error = exc

                # Some newer Interaction API errors may be
                # represented differently by SDK versions.
                # Detect 429 defensively without leaking the
                # raw provider exception.

                if (
                    self._is_rate_limit_error(
                        exc
                    )
                ):

                    logger.warning(
                        (
                            "gemini_rate_limited "
                            "model=%s"
                        ),
                        selected_model,
                    )

                    raise (
                        GeminiRateLimitError(
                            "AI service is temporarily "
                            "rate limited. Please try "
                            "again shortly."
                        )
                    ) from exc

                logger.exception(
                    (
                        "structured_generation_"
                        "unexpected_error "
                        "model=%s"
                    ),
                    selected_model,
                )

                raise (
                    StructuredGenerationError(
                        "AI service encountered "
                        "an unexpected error."
                    )
                ) from exc

        raise (
            StructuredGenerationError(
                "Structured generation failed."
            )
        ) from last_error


structured_gemini_service = (
    StructuredGeminiService()
)