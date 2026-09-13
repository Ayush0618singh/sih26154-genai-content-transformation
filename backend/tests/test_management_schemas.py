from datetime import (
    datetime,
    timezone,
)
from uuid import uuid4

from app.schemas.management import (
    DashboardOverviewResponse,
    DistributionItem,
    PaginationMeta,
    TimelinePoint,
)


def test_pagination_meta() -> None:

    pagination = PaginationMeta(
        page=1,
        page_size=20,
        total=45,
        total_pages=3,
    )

    assert (
        pagination.total_pages
        == 3
    )


def test_dashboard_overview() -> None:

    dashboard = (
        DashboardOverviewResponse(
            total_documents=5,
            total_transformations=4,
            total_generated_outputs=12,
            total_exports=3,
            completed_transformations=3,
            failed_transformations=1,
            success_rate=75.0,
            total_storage_bytes=1024,
            recent_documents=[],
            recent_transformations=[],
            recent_activity=[],
        )
    )

    assert (
        dashboard.success_rate
        == 75.0
    )

    assert (
        dashboard.total_documents
        == 5
    )


def test_distribution_item() -> None:

    item = DistributionItem(
        label="pdf",
        count=10,
    )

    assert item.count == 10


def test_timeline_point() -> None:

    point = TimelinePoint(
        date="2026-09-13",
        documents=2,
        transformations=3,
        exports=1,
    )

    assert (
        point.transformations
        == 3
    )