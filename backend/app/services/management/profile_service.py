from uuid import UUID

from app.core.supabase import (
    get_supabase_admin_client,
)
from app.schemas.management import (
    ProfileResponse,
    ProfileUpdateRequest,
)


class ProfileService:

    def __init__(self) -> None:
        self.admin = (
            get_supabase_admin_client()
        )

    def get_profile(
        self,
        user_id: UUID,
        email: str | None,
    ) -> ProfileResponse:

        response = (
            self.admin.table(
                "profiles"
            )
            .select("*")
            .eq(
                "id",
                str(user_id),
            )
            .limit(1)
            .execute()
        )

        if not response.data:
            create_response = (
                self.admin.table(
                    "profiles"
                )
                .insert(
                    {
                        "id": str(
                            user_id
                        ),
                        "full_name": "",
                        "role": "user",
                    }
                )
                .execute()
            )

            if not create_response.data:
                raise RuntimeError(
                    "Could not create "
                    "user profile."
                )

            profile = (
                create_response.data[
                    0
                ]
            )

        else:
            profile = (
                response.data[
                    0
                ]
            )

        return ProfileResponse(
            id=user_id,
            email=email,
            full_name=(
                profile.get(
                    "full_name"
                )
            ),
            avatar_url=(
                profile.get(
                    "avatar_url"
                )
            ),
            role=(
                profile.get(
                    "role"
                )
                or "user"
            ),
            created_at=(
                profile.get(
                    "created_at"
                )
            ),
            updated_at=(
                profile.get(
                    "updated_at"
                )
            ),
        )

    def update_profile(
        self,
        user_id: UUID,
        email: str | None,
        request: ProfileUpdateRequest,
    ) -> ProfileResponse:

        update_data = (
            request.model_dump(
                exclude_none=True
            )
        )

        if update_data:
            (
                self.admin.table(
                    "profiles"
                )
                .update(
                    update_data
                )
                .eq(
                    "id",
                    str(user_id),
                )
                .execute()
            )

        return self.get_profile(
            user_id,
            email,
        )


profile_service = ProfileService()