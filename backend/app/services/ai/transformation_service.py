from uuid import UUID, uuid4

from app.core.supabase import (
    get_supabase_admin_client,
)
from app.schemas.transformation import (
    GeneratedOutputRecord,
    OutputType,
    TransformationRequest,
    TransformationResponse,
)
from app.services.ai.analysis_service import (
    content_analysis_service,
)
from app.services.ai.prompts import (
    build_rag_query,
)
from app.services.ai.transformation_generator import (
    transformation_generator,
)
from app.services.rag.rag_service import (
    rag_service,
)


class TransformationService:

    def __init__(self) -> None:
        self.admin = (
            get_supabase_admin_client()
        )

    def _get_document(
        self,
        document_id: UUID,
        user_id: UUID,
    ) -> dict:
        response = (
            self.admin.table(
                "source_documents"
            )
            .select(
                "id, original_filename, "
                "mime_type, input_type, "
                "status, extracted_text, "
                "page_count, character_count"
            )
            .eq(
                "id",
                str(document_id),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .limit(1)
            .execute()
        )

        if not response.data:
            raise ValueError(
                "Source document not found."
            )

        document = response.data[0]

        if document.get("status") != "ready":
            raise ValueError(
                "Source document is not ready."
            )

        if not (
            document.get(
                "extracted_text"
            )
            or ""
        ).strip():
            raise ValueError(
                "Source document has no "
                "extracted text."
            )

        return document

    @staticmethod
    def _build_context(
        chunks: list,
    ) -> str:
        if not chunks:
            return ""

        sections: list[str] = []

        for index, chunk in enumerate(
            chunks,
            start=1,
        ):
            sections.append(
                (
                    f"[Retrieved Source "
                    f"{index}]\n"
                    f"{chunk.text}"
                )
            )

        return "\n\n".join(
            sections
        )

    @staticmethod
    def _extract_title(
        output_type: OutputType,
        data: dict,
    ) -> str | None:
        title = data.get(
            "title"
        )

        if title:
            return str(title)

        return output_type.value.replace(
            "_",
            " ",
        ).title()

    async def transform(
        self,
        request: TransformationRequest,
        user_id: UUID,
    ) -> TransformationResponse:
        document = self._get_document(
            request.document_id,
            user_id,
        )

        transformation_id = uuid4()

        (
            self.admin.table(
                "transformations"
            )
            .insert(
                {
                    "id": str(
                        transformation_id
                    ),
                    "user_id": str(
                        user_id
                    ),
                    "source_document_id": str(
                        request.document_id
                    ),
                    "title": (
                        f"Transformation - "
                        f"{document['original_filename']}"
                    ),
                    "status": "processing",
                    "target_audience": (
                        request.target_audience
                    ),
                    "tone": request.tone,
                    "language": (
                        request.language
                    ),
                    "detail_level": (
                        request.detail_level
                    ),
                    "objective": (
                        request.objective
                    ),
                    "selected_outputs": [
                        item.value
                        for item
                        in request.selected_outputs
                    ],
                    "custom_instructions": (
                        request.custom_instructions
                    ),
                    "source_snapshot": {
                        "filename": (
                            document[
                                "original_filename"
                            ]
                        ),
                        "mime_type": (
                            document[
                                "mime_type"
                            ]
                        ),
                        "input_type": (
                            document[
                                "input_type"
                            ]
                        ),
                        "page_count": (
                            document[
                                "page_count"
                            ]
                        ),
                        "character_count": (
                            document[
                                "character_count"
                            ]
                        ),
                    },
                }
            )
            .execute()
        )

        (
            self.admin.table(
                "activity_events"
            )
            .insert(
                {
                    "user_id": str(
                        user_id
                    ),
                    "event_type": (
                        "transformation_started"
                    ),
                    "source_document_id": str(
                        request.document_id
                    ),
                    "transformation_id": str(
                        transformation_id
                    ),
                    "metadata": {
                        "selected_outputs": [
                            item.value
                            for item in
                            request.selected_outputs
                        ]
                    },
                }
            )
            .execute()
        )

        try:
            analysis = await (
                content_analysis_service
                .analyse(
                    text=(
                        document[
                            "extracted_text"
                        ]
                    ),
                    filename=(
                        document[
                            "original_filename"
                        ]
                    ),
                )
            )

            (
                self.admin.table(
                    "transformations"
                )
                .update(
                    {
                        "analysis_json": (
                            analysis.model_dump(
                                mode="json"
                            )
                        )
                    }
                )
                .eq(
                    "id",
                    str(
                        transformation_id
                    ),
                )
                .eq(
                    "user_id",
                    str(user_id),
                )
                .execute()
            )

            rag_context = ""

            if request.use_rag:
                rag_query = build_rag_query(
                    request,
                    analysis,
                )

                chunks = await (
                    rag_service.retrieve(
                        document_id=(
                            request.document_id
                        ),
                        user_id=user_id,
                        query=rag_query,
                    )
                )

                rag_context = (
                    self._build_context(
                        chunks
                    )
                )

            else:
                raw_text = (
                    document[
                        "extracted_text"
                    ]
                )

                rag_context = raw_text[
                    :30000
                ]

            generated = await (
                transformation_generator
                .generate(
                    request=request,
                    analysis=analysis,
                    rag_context=rag_context,
                )
            )

            output_records: list[
                GeneratedOutputRecord
            ] = []

            for (
                output_type,
                output_model,
            ) in generated.items():
                output_id = uuid4()

                output_data = (
                    output_model.model_dump(
                        mode="json"
                    )
                )

                title = (
                    self._extract_title(
                        output_type,
                        output_data,
                    )
                )

                (
                    self.admin.table(
                        "generated_outputs"
                    )
                    .insert(
                        {
                            "id": str(
                                output_id
                            ),
                            "user_id": str(
                                user_id
                            ),
                            "transformation_id": (
                                str(
                                    transformation_id
                                )
                            ),
                            "output_type": (
                                output_type.value
                            ),
                            "title": title,
                            "content_json": (
                                output_data
                            ),
                        }
                    )
                    .execute()
                )

                output_records.append(
                    GeneratedOutputRecord(
                        id=output_id,
                        output_type=(
                            output_type
                        ),
                        title=title,
                        content=output_data,
                    )
                )

            (
                self.admin.table(
                    "transformations"
                )
                .update(
                    {
                        "status": (
                            "completed"
                        ),
                        "error_message": None,
                    }
                )
                .eq(
                    "id",
                    str(
                        transformation_id
                    ),
                )
                .eq(
                    "user_id",
                    str(user_id),
                )
                .execute()
            )

            (
                self.admin.table(
                    "activity_events"
                )
                .insert(
                    {
                        "user_id": str(
                            user_id
                        ),
                        "event_type": (
                            "transformation_completed"
                        ),
                        "source_document_id": (
                            str(
                                request.document_id
                            )
                        ),
                        "transformation_id": (
                            str(
                                transformation_id
                            )
                        ),
                        "metadata": {
                            "output_count": len(
                                output_records
                            )
                        },
                    }
                )
                .execute()
            )

            return TransformationResponse(
                transformation_id=(
                    transformation_id
                ),
                document_id=(
                    request.document_id
                ),
                status="completed",
                analysis=analysis,
                outputs=output_records,
            )

        except Exception as exc:
            (
                self.admin.table(
                    "transformations"
                )
                .update(
                    {
                        "status": "failed",
                        "error_message": (
                            str(exc)[:2000]
                        ),
                    }
                )
                .eq(
                    "id",
                    str(
                        transformation_id
                    ),
                )
                .eq(
                    "user_id",
                    str(user_id),
                )
                .execute()
            )

            (
                self.admin.table(
                    "activity_events"
                )
                .insert(
                    {
                        "user_id": str(
                            user_id
                        ),
                        "event_type": (
                            "transformation_failed"
                        ),
                        "source_document_id": (
                            str(
                                request.document_id
                            )
                        ),
                        "transformation_id": (
                            str(
                                transformation_id
                            )
                        ),
                        "metadata": {
                            "error": (
                                str(exc)[:1000]
                            )
                        },
                    }
                )
                .execute()
            )

            raise


transformation_service = (
    TransformationService()
)