import math
from collections import Counter
from datetime import (
    datetime,
    timedelta,
    timezone,
)
from uuid import UUID

from app.core.supabase import (
    get_supabase_admin_client,
)
from app.schemas.management import (
    ActivityEventItem,
    ActivityListResponse,
    AnalyticsResponse,
    DashboardOverviewResponse,
    DistributionItem,
    DocumentListItem,
    PaginationMeta,
    TimelinePoint,
    TransformationListItem,
)
from app.schemas.transformation import (
    OutputType,
)


SOURCE_TYPES = [
    "pdf",
    "docx",
    "text",
    "image",
    "csv",
    "xlsx",
    "json",
    "video",
]


TRANSFORMATION_STATUSES = [
    "pending",
    "processing",
    "completed",
    "failed",
]


class AnalyticsService:

    def __init__(self) -> None:
        self.admin = (
            get_supabase_admin_client()
        )

    # ========================================================
    # Helpers
    # ========================================================

    def _count(
        self,
        table: str,
        user_id: UUID,
        column: str | None = None,
        value: str | None = None,
    ) -> int:

        query = (
            self.admin.table(
                table
            )
            .select(
                "id",
                count="exact",
            )
            .eq(
                "user_id",
                str(user_id),
            )
        )

        if (
            column is not None
            and value is not None
        ):
            query = query.eq(
                column,
                value,
            )

        response = (
            query.execute()
        )

        return int(
            response.count
            or 0
        )

    def _fetch_all_user_rows(
        self,
        table: str,
        columns: str,
        user_id: UUID,
    ) -> list[dict]:

        page_size = 1000
        offset = 0

        rows: list[
            dict
        ] = []

        while True:
            response = (
                self.admin.table(
                    table
                )
                .select(
                    columns
                )
                .eq(
                    "user_id",
                    str(user_id),
                )
                .range(
                    offset,
                    offset
                    + page_size
                    - 1,
                )
                .execute()
            )

            batch = (
                response.data
                or []
            )

            rows.extend(
                batch
            )

            if len(batch) < page_size:
                break

            offset += page_size

        return rows

    # ========================================================
    # Overview
    # ========================================================

    def overview(
        self,
        user_id: UUID,
    ) -> DashboardOverviewResponse:

        total_documents = (
            self._count(
                "source_documents",
                user_id,
            )
        )

        total_transformations = (
            self._count(
                "transformations",
                user_id,
            )
        )

        total_generated_outputs = (
            self._count(
                "generated_outputs",
                user_id,
            )
        )

        total_exports = (
            self._count(
                "exported_files",
                user_id,
            )
        )

        completed = (
            self._count(
                "transformations",
                user_id,
                "status",
                "completed",
            )
        )

        failed = (
            self._count(
                "transformations",
                user_id,
                "status",
                "failed",
            )
        )

        completed_or_failed = (
            completed + failed
        )

        success_rate = (
            round(
                (
                    completed
                    / completed_or_failed
                )
                * 100,
                2,
            )
            if completed_or_failed
            else 0.0
        )

        # ----------------------------------------------------
        # Storage usage
        # ----------------------------------------------------

        source_rows = (
            self._fetch_all_user_rows(
                "source_documents",
                "file_size",
                user_id,
            )
        )

        export_rows = (
            self._fetch_all_user_rows(
                "exported_files",
                "file_size",
                user_id,
            )
        )

        total_storage_bytes = sum(
            int(
                item.get(
                    "file_size"
                )
                or 0
            )
            for item in (
                source_rows
                + export_rows
            )
        )

        # ----------------------------------------------------
        # Recent documents
        # ----------------------------------------------------

        documents_response = (
            self.admin.table(
                "source_documents"
            )
            .select(
                (
                    "id, original_filename, "
                    "mime_type, file_size, "
                    "input_type, status, "
                    "extraction_method, "
                    "page_count, "
                    "character_count, "
                    "created_at, updated_at"
                )
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .order(
                "created_at",
                desc=True,
            )
            .range(
                0,
                4,
            )
            .execute()
        )

        recent_documents = [
            DocumentListItem(
                **item
            )
            for item
            in (
                documents_response.data
                or []
            )
        ]

        # ----------------------------------------------------
        # Recent transformations
        # ----------------------------------------------------

        transformations_response = (
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
                )
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .order(
                "created_at",
                desc=True,
            )
            .range(
                0,
                4,
            )
            .execute()
        )

        recent_rows = (
            transformations_response.data
            or []
        )

        transformation_ids = [
            item["id"]
            for item
            in recent_rows
        ]

        output_counter: Counter = (
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

            output_counter = Counter(
                row[
                    "transformation_id"
                ]
                for row
                in (
                    outputs_response.data
                    or []
                )
            )

        recent_transformations = [
            TransformationListItem(
                **item,
                output_count=(
                    output_counter[
                        item["id"]
                    ]
                ),
            )
            for item
            in recent_rows
        ]

        # ----------------------------------------------------
        # Recent activity
        # ----------------------------------------------------

        activity_response = (
            self.admin.table(
                "activity_events"
            )
            .select("*")
            .eq(
                "user_id",
                str(user_id),
            )
            .order(
                "created_at",
                desc=True,
            )
            .range(
                0,
                7,
            )
            .execute()
        )

        recent_activity = [
            ActivityEventItem(
                **item
            )
            for item
            in (
                activity_response.data
                or []
            )
        ]

        return DashboardOverviewResponse(
            total_documents=(
                total_documents
            ),
            total_transformations=(
                total_transformations
            ),
            total_generated_outputs=(
                total_generated_outputs
            ),
            total_exports=(
                total_exports
            ),
            completed_transformations=(
                completed
            ),
            failed_transformations=(
                failed
            ),
            success_rate=(
                success_rate
            ),
            total_storage_bytes=(
                total_storage_bytes
            ),
            recent_documents=(
                recent_documents
            ),
            recent_transformations=(
                recent_transformations
            ),
            recent_activity=(
                recent_activity
            ),
        )

    # ========================================================
    # Analytics
    # ========================================================

    def analytics(
        self,
        user_id: UUID,
        days: int,
    ) -> AnalyticsResponse:

        input_distribution: list[
            DistributionItem
        ] = []

        for input_type in (
            SOURCE_TYPES
        ):
            count = self._count(
                "source_documents",
                user_id,
                "input_type",
                input_type,
            )

            if count:
                input_distribution.append(
                    DistributionItem(
                        label=input_type,
                        count=count,
                    )
                )

        output_distribution: list[
            DistributionItem
        ] = []

        for output_type in (
            OutputType
        ):
            count = self._count(
                "generated_outputs",
                user_id,
                "output_type",
                output_type.value,
            )

            if count:
                output_distribution.append(
                    DistributionItem(
                        label=(
                            output_type.value
                        ),
                        count=count,
                    )
                )

        status_distribution: list[
            DistributionItem
        ] = []

        for transformation_status in (
            TRANSFORMATION_STATUSES
        ):
            count = self._count(
                "transformations",
                user_id,
                "status",
                transformation_status,
            )

            if count:
                status_distribution.append(
                    DistributionItem(
                        label=(
                            transformation_status
                        ),
                        count=count,
                    )
                )

        # ----------------------------------------------------
        # Timeline
        # ----------------------------------------------------

        now = datetime.now(
            timezone.utc
        )

        first_date = (
            now.date()
            - timedelta(
                days=days - 1
            )
        )

        start_datetime = datetime.combine(
            first_date,
            datetime.min.time(),
            tzinfo=timezone.utc,
        )

        document_response = (
            self.admin.table(
                "source_documents"
            )
            .select(
                "created_at"
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .gte(
                "created_at",
                start_datetime.isoformat(),
            )
            .execute()
        )

        transformation_response = (
            self.admin.table(
                "transformations"
            )
            .select(
                "created_at"
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .gte(
                "created_at",
                start_datetime.isoformat(),
            )
            .execute()
        )

        export_response = (
            self.admin.table(
                "exported_files"
            )
            .select(
                "created_at"
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .gte(
                "created_at",
                start_datetime.isoformat(),
            )
            .execute()
        )

        def date_counter(
            rows: list[dict],
        ) -> Counter:

            counter: Counter = (
                Counter()
            )

            for row in rows:
                value = row.get(
                    "created_at"
                )

                if not value:
                    continue

                try:
                    date_value = (
                        datetime.fromisoformat(
                            str(value).replace(
                                "Z",
                                "+00:00",
                            )
                        )
                        .date()
                        .isoformat()
                    )

                    counter[
                        date_value
                    ] += 1

                except ValueError:
                    continue

            return counter

        document_counter = (
            date_counter(
                document_response.data
                or []
            )
        )

        transformation_counter = (
            date_counter(
                transformation_response.data
                or []
            )
        )

        export_counter = (
            date_counter(
                export_response.data
                or []
            )
        )

        timeline: list[
            TimelinePoint
        ] = []

        for offset in range(
            days
        ):
            current_date = (
                first_date
                + timedelta(
                    days=offset
                )
            )

            label = (
                current_date.isoformat()
            )

            timeline.append(
                TimelinePoint(
                    date=label,
                    documents=(
                        document_counter[
                            label
                        ]
                    ),
                    transformations=(
                        transformation_counter[
                            label
                        ]
                    ),
                    exports=(
                        export_counter[
                            label
                        ]
                    ),
                )
            )

        return AnalyticsResponse(
            days=days,
            input_type_distribution=(
                input_distribution
            ),
            output_type_distribution=(
                output_distribution
            ),
            transformation_status_distribution=(
                status_distribution
            ),
            timeline=timeline,
        )

    # ========================================================
    # Activity pagination
    # ========================================================

    def activity(
        self,
        user_id: UUID,
        page: int,
        page_size: int,
    ) -> ActivityListResponse:

        start = (
            page - 1
        ) * page_size

        end = (
            start
            + page_size
            - 1
        )

        response = (
            self.admin.table(
                "activity_events"
            )
            .select(
                "*",
                count="exact",
            )
            .eq(
                "user_id",
                str(user_id),
            )
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

        return ActivityListResponse(
            items=[
                ActivityEventItem(
                    **item
                )
                for item
                in (
                    response.data
                    or []
                )
            ],
            pagination=PaginationMeta(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=(
                    total_pages
                ),
            ),
        )


analytics_service = (
    AnalyticsService()
)