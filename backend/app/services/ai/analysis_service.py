from __future__ import annotations

from typing import Any

from app.schemas.reliability import (
    ReliableDocumentAnalysis,
)
from app.services.analysis.hierarchical_analysis import (
    hierarchical_analysis_service,
)


class AnalysisService:

    @staticmethod
    def _resolve_text(
        *,
        text: str | None = None,
        source_text: str | None = None,
        content: str | None = None,
        document: Any = None,
    ) -> str:

        for value in (
            text,
            source_text,
            content,
        ):
            if (
                isinstance(value, str)
                and value.strip()
            ):
                return value

        if document is not None:

            if isinstance(
                document,
                dict,
            ):
                for key in (
                    "extracted_text",
                    "text",
                    "content",
                ):
                    value = document.get(
                        key
                    )

                    if (
                        isinstance(value, str)
                        and value.strip()
                    ):
                        return value

            for attribute in (
                "extracted_text",
                "text",
                "content",
            ):
                value = getattr(
                    document,
                    attribute,
                    None,
                )

                if (
                    isinstance(value, str)
                    and value.strip()
                ):
                    return value

        raise ValueError(
            "No source text was supplied "
            "for analysis."
        )

    @staticmethod
    def _resolve_metadata(
        *,
        metadata: dict[str, Any] | None = None,
        source_metadata: dict[str, Any] | None = None,
        document: Any = None,
        filename: str | None = None,
    ) -> dict[str, Any]:

        combined: dict[
            str,
            Any,
        ] = {}

        if source_metadata:
            combined.update(
                source_metadata
            )

        if metadata:
            combined.update(
                metadata
            )

        if filename:
            combined[
                "filename"
            ] = filename

        if document is not None:

            if isinstance(
                document,
                dict,
            ):
                document_metadata = (
                    document.get(
                        "metadata"
                    )
                )

                extraction_method = (
                    document.get(
                        "extraction_method"
                    )
                )

            else:
                document_metadata = getattr(
                    document,
                    "metadata",
                    None,
                )

                extraction_method = getattr(
                    document,
                    "extraction_method",
                    None,
                )

            if isinstance(
                document_metadata,
                dict,
            ):
                combined.update(
                    document_metadata
                )

            if extraction_method:
                combined[
                    "extraction_method"
                ] = str(
                    extraction_method
                )

        return combined

    async def analyze_document(
        self,
        text: str | None = None,
        *,
        source_text: str | None = None,
        content: str | None = None,
        document_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        source_metadata: dict[str, Any] | None = None,
        document: Any = None,
        filename: str | None = None,
        **_: Any,
    ) -> ReliableDocumentAnalysis:

        resolved_text = (
            self._resolve_text(
                text=text,
                source_text=source_text,
                content=content,
                document=document,
            )
        )

        resolved_metadata = (
            self._resolve_metadata(
                metadata=metadata,
                source_metadata=source_metadata,
                document=document,
                filename=filename,
            )
        )

        result = (
            await hierarchical_analysis_service
            .analyze(
                text=resolved_text,
                document_id=document_id,
                metadata=resolved_metadata,
            )
        )

        # IMPORTANT:
        # Return the Pydantic model itself.
        # Serialization must happen at API / DB boundaries.
        return result

    async def analyze_source(
        self,
        *args: Any,
        **kwargs: Any,
    ) -> ReliableDocumentAnalysis:

        return await self.analyze_document(
            *args,
            **kwargs,
        )

    async def analyze_content(
        self,
        *args: Any,
        **kwargs: Any,
    ) -> ReliableDocumentAnalysis:

        return await self.analyze_document(
            *args,
            **kwargs,
        )

    async def analyze(
        self,
        *args: Any,
        **kwargs: Any,
    ) -> ReliableDocumentAnalysis:

        return await self.analyze_document(
            *args,
            **kwargs,
        )

    async def analyse(
        self,
        *args: Any,
        **kwargs: Any,
    ) -> ReliableDocumentAnalysis:
        """
        Backward-compatible British spelling used by
        older transformation code.
        """

        return await self.analyze_document(
            *args,
            **kwargs,
        )

    async def analyze_json(
        self,
        *args: Any,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """
        Explicit JSON-safe helper for callers that
        genuinely need a dictionary.
        """

        result = await self.analyze_document(
            *args,
            **kwargs,
        )

        return result.model_dump(
            mode="json"
        )


analysis_service = (
    AnalysisService()
)

content_analysis_service = (
    analysis_service
)