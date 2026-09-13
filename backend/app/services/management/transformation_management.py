import math
from collections import Counter
from uuid import UUID

from app.core.supabase import (
    get_supabase_admin_client,
)
from app.schemas.management import (
    PaginationMeta,
    TransformationListItem,
    TransformationListResponse,
)
from app.schemas.transformation import (
    TransformationDetailResponse,
)
from app.services.storage.supabase_storage import (
    storage_service,
)


class TransformationManagementService:

    def __init__(self) -> None:
        self.admin = (
            get_supabase_admin_client()
        )

    # ========================================================
    # LIST
    # ========================================================

    def list_transformations(
        self,
        user_id: UUID,
        page: int,
        page_size: int,
        status: str | None = None,
    ) -> TransformationListResponse:

        start = (
            page - 1
        ) * page_size

        end = (
            start
            + page_size
            - 1
        )

        query = (
            self.admin.table(
                "transformations"
            )
            .select(
                (
                    "id, source_document_id, "
                    "title, status, "
                    "target_audience, tone, "
                    "language, detail_level, "
                    "objective, "
                    "selected_outputs, "
                    "created_at, updated_at"
                ),
                count="exact",
            )
            .eq(
                "user_id",
                str(user_id),
            )
        )

        if status:
            query = query.eq(
                "status",
                status,
            )

        response = (
            query
            .order(
                "created_at",
                desc=True,
            )
            .range(
                start,
                end,
            )
            .execute()
        )

        rows = (
            response.data
            or []
        )

        transformation_ids = [
            row["id"]
            for row in rows
        ]

        output_counts: Counter = (
            Counter()
        )

        if transformation_ids:
            outputs_response = (
                self.admin.table(
                    "generated_outputs"
                )
                .select(
                    "transformation_id"
                )
                .eq(
                    "user_id",
                    str(user_id),
                )
                .in_(
                    "transformation_id",
                    transformation_ids,
                )
                .execute()
            )

            output_counts = Counter(
                item[
                    "transformation_id"
                ]
                for item
                in (
                    outputs_response.data
                    or []
                )
            )

        items = [
            TransformationListItem(
                **row,
                output_count=(
                    output_counts[
                        row["id"]
                    ]
                ),
            )
            for row in rows
        ]

        total = int(
            response.count
            or 0
        )

        total_pages = (
            math.ceil(
                total
                / page_size
            )
            if total
            else 0
        )

        return TransformationListResponse(
            items=items,
            pagination=PaginationMeta(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=(
                    total_pages
                ),
            ),
        )

    # ========================================================
    # DETAIL
    # ========================================================

    def get_transformation(
        self,
        transformation_id: UUID,
        user_id: UUID,
    ) -> TransformationDetailResponse:

        response = (
            self.admin.table(
                "transformations"
            )
            .select("*")
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
            .limit(1)
            .execute()
        )

        if not response.data:
            raise ValueError(
                "Transformation not found."
            )

        transformation = (
            response.data[0]
        )

        outputs_response = (
            self.admin.table(
                "generated_outputs"
            )
            .select(
                (
                    "id, output_type, "
                    "title, content_json, "
                    "storage_path, "
                    "mime_type, created_at"
                )
            )
            .eq(
                "transformation_id",
                str(
                    transformation_id
                ),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .order(
                "created_at"
            )
            .execute()
        )

        document_id = (
            transformation.get(
                "source_document_id"
            )
        )

        return (
            TransformationDetailResponse(
                transformation_id=(
                    transformation_id
                ),
                document_id=(
                    UUID(
                        document_id
                    )
                    if document_id
                    else None
                ),
                title=(
                    transformation.get(
                        "title"
                    )
                ),
                status=(
                    transformation[
                        "status"
                    ]
                ),
                target_audience=(
                    transformation.get(
                        "target_audience"
                    )
                ),
                tone=(
                    transformation.get(
                        "tone"
                    )
                ),
                language=(
                    transformation.get(
                        "language"
                    )
                    or "English"
                ),
                detail_level=(
                    transformation.get(
                        "detail_level"
                    )
                ),
                objective=(
                    transformation.get(
                        "objective"
                    )
                ),
                selected_outputs=(
                    transformation.get(
                        "selected_outputs"
                    )
                    or []
                ),
                analysis=(
                    transformation.get(
                        "analysis_json"
                    )
                    or {}
                ),
                outputs=(
                    outputs_response.data
                    or []
                ),
            )
        )

    # ========================================================
    # DELETE
    # ========================================================

    def delete_transformation(
        self,
        transformation_id: UUID,
        user_id: UUID,
    ) -> None:

        response = (
            self.admin.table(
                "transformations"
            )
            .select(
                "id, title"
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
            .limit(1)
            .execute()
        )

        if not response.data:
            raise ValueError(
                "Transformation not found."
            )

        transformation = (
            response.data[0]
        )

        # ----------------------------------------------------
        # Remove physical export files
        # ----------------------------------------------------

        exports_response = (
            self.admin.table(
                "exported_files"
            )
            .select(
                "storage_path"
            )
            .eq(
                "transformation_id",
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

        for exported_file in (
            exports_response.data
            or []
        ):
            storage_path = (
                exported_file.get(
                    "storage_path"
                )
            )

            if not storage_path:
                continue

            try:
                storage_service.delete_generated_output(
                    storage_path
                )

            except Exception:
                pass

        # ----------------------------------------------------
        # Delete transformation
        # children cascade automatically
        # ----------------------------------------------------

        (
            self.admin.table(
                "transformations"
            )
            .delete()
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
                        "transformation_deleted"
                    ),
                    "metadata": {
                        "transformation_id": (
                            str(
                                transformation_id
                            )
                        ),
                        "title": (
                            transformation.get(
                                "title"
                            )
                        ),
                    },
                }
            )
            .execute()
        )


transformation_management_service = (
    TransformationManagementService()
)