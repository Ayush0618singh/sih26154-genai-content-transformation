from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    AuthenticatedUser,
)
from app.schemas.management import (
    ActivityListResponse,
    AnalyticsResponse,
    DashboardOverviewResponse,
)
from app.services.management.analytics_service import (
    analytics_service,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ============================================================
# Dashboard overview
# ============================================================


@router.get(
    "/overview",
    response_model=(
        DashboardOverviewResponse
    ),
)
async def dashboard_overview(
    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> DashboardOverviewResponse:

    return (
        analytics_service
        .overview(
            current_user.id
        )
    )


# ============================================================
# Analytics
# ============================================================


@router.get(
    "/analytics",
    response_model=(
        AnalyticsResponse
    ),
)
async def dashboard_analytics(
    days: int = Query(
        default=14,
        ge=7,
        le=90,
    ),

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> AnalyticsResponse:

    return (
        analytics_service
        .analytics(
            user_id=(
                current_user.id
            ),
            days=days,
        )
    )


# ============================================================
# Activity feed
# ============================================================


@router.get(
    "/activity",
    response_model=(
        ActivityListResponse
    ),
)
async def dashboard_activity(
    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> ActivityListResponse:

    return (
        analytics_service
        .activity(
            user_id=(
                current_user.id
            ),
            page=page,
            page_size=page_size,
        )
    )