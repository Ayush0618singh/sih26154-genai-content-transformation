from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from app.core.config import settings
from app.core.supabase import (
    get_supabase_admin_client,
)


router = APIRouter()


# ============================================================
# Liveness
# ============================================================


@router.get(
    "/health",
    summary="Application health check",
    tags=["System"],
)
async def health_check() -> dict:

    return {
        "status": "healthy",
        "application": (
            settings.app_name
        ),
        "version": (
            settings.app_version
        ),
        "environment": (
            settings.app_env
        ),
        "timestamp": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),
    }


# ============================================================
# Readiness
# ============================================================


@router.get(
    "/ready",
    summary=(
        "Application readiness check"
    ),
    tags=["System"],
)
async def readiness_check() -> dict:

    checks = {
        "gemini_configured": bool(
            settings.gemini_api_key
        ),

        "supabase_configured": bool(
            settings.supabase_url
            and settings.supabase_anon_key
            and settings.supabase_service_role_key
        ),

        "database": False,
    }

    database_error: (
        str | None
    ) = None

    if checks[
        "supabase_configured"
    ]:
        try:
            admin = (
                get_supabase_admin_client()
            )

            (
                admin.table(
                    "profiles"
                )
                .select("id")
                .limit(1)
                .execute()
            )

            checks[
                "database"
            ] = True

        except Exception as exc:
            database_error = (
                str(exc)
            )

    ready = all(
        checks.values()
    )

    payload = {
        "status": (
            "ready"
            if ready
            else "not_ready"
        ),

        "checks": checks,

        "timestamp": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),
    }

    if database_error:
        payload[
            "database_error"
        ] = database_error

    if not ready:
        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=payload,
        )

    return payload