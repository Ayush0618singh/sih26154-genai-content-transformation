from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    AuthenticatedUser,
)
from app.schemas.management import (
    ProfileResponse,
    ProfileUpdateRequest,
)
from app.services.management.profile_service import (
    profile_service,
)


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


@router.get(
    "/me",
    response_model=(
        ProfileResponse
    ),
)
async def get_my_profile(
    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> ProfileResponse:

    try:
        return (
            profile_service
            .get_profile(
                user_id=(
                    current_user.id
                ),
                email=(
                    current_user.email
                ),
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not retrieve profile: "
                f"{exc}"
            ),
        ) from exc


@router.patch(
    "/me",
    response_model=(
        ProfileResponse
    ),
)
async def update_my_profile(
    request: ProfileUpdateRequest,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> ProfileResponse:

    try:
        return (
            profile_service
            .update_profile(
                user_id=(
                    current_user.id
                ),
                email=(
                    current_user.email
                ),
                request=request,
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not update profile: "
                f"{exc}"
            ),
        ) from exc