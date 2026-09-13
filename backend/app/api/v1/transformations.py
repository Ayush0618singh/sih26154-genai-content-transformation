from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    AuthenticatedUser,
)
from app.schemas.management import (
    DeleteResponse,
    TransformationListResponse,
)
from app.schemas.transformation import (
    TransformationDetailResponse,
    TransformationRequest,
    TransformationResponse,
)
from app.services.ai.transformation_service import (
    transformation_service,
)
from app.services.management.transformation_management import (
    transformation_management_service,
)


router = APIRouter(
    prefix="/transformations",
    tags=["Transformations"],
)


# ============================================================
# Create transformation
# ============================================================


@router.post(
    "",
    response_model=(
        TransformationResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
async def create_transformation(
    request: TransformationRequest,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> TransformationResponse:

    try:
        return await (
            transformation_service
            .transform(
                request=request,
                user_id=(
                    current_user.id
                ),
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Transformation failed: "
                f"{type(exc).__name__}: "
                f"{exc}"
            ),
        ) from exc


# ============================================================
# List transformation history
# ============================================================


@router.get(
    "",
    response_model=(
        TransformationListResponse
    ),
)
async def list_transformations(
    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> TransformationListResponse:

    return (
        transformation_management_service
        .list_transformations(
            user_id=(
                current_user.id
            ),
            page=page,
            page_size=page_size,
            status=status_filter,
        )
    )


# ============================================================
# Transformation detail
# ============================================================


@router.get(
    "/{transformation_id}",
    response_model=(
        TransformationDetailResponse
    ),
)
async def get_transformation(
    transformation_id: UUID,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> TransformationDetailResponse:

    try:
        return (
            transformation_management_service
            .get_transformation(
                transformation_id=(
                    transformation_id
                ),
                user_id=(
                    current_user.id
                ),
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc


# ============================================================
# Delete transformation
# ============================================================


@router.delete(
    "/{transformation_id}",
    response_model=DeleteResponse,
)
async def delete_transformation(
    transformation_id: UUID,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> DeleteResponse:

    try:
        (
            transformation_management_service
            .delete_transformation(
                transformation_id=(
                    transformation_id
                ),
                user_id=(
                    current_user.id
                ),
            )
        )

        return DeleteResponse(
            id=transformation_id,
            status="deleted",
            message=(
                "Transformation and "
                "generated exports deleted."
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Transformation deletion "
                f"failed: {exc}"
            ),
        ) from exc