from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.security import (
    get_current_user,
)
from app.core.supabase import (
    get_supabase_admin_client,
)
from app.schemas.auth import (
    AuthenticatedUser,
)
from app.schemas.export import (
    ExportArtifact,
    ExportBatchResponse,
    ExportFormat,
    ExportListResponse,
    ExportRequest,
    SignedDownloadResponse,
)
from app.schemas.management import (
    DeleteResponse,
)
from app.services.generators.export_service import (
    SIGNED_URL_EXPIRY_SECONDS,
    export_service,
)
from app.services.storage.supabase_storage import (
    storage_service,
)


router = APIRouter(
    prefix="/exports",
    tags=["Exports"],
)


# ============================================================
# Generate exports
# ============================================================


@router.post(
    "/{transformation_id}/generate",
    response_model=(
        ExportBatchResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
async def generate_exports(
    transformation_id: UUID,
    request: ExportRequest,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> ExportBatchResponse:

    try:
        return await (
            export_service
            .generate_exports(
                transformation_id=(
                    transformation_id
                ),
                user_id=(
                    current_user.id
                ),
                request=request,
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
                "Export generation failed: "
                f"{type(exc).__name__}: "
                f"{exc}"
            ),
        ) from exc


# ============================================================
# Generate signed download URL
# ============================================================


@router.get(
    "/files/{export_id}/download-url",
    response_model=(
        SignedDownloadResponse
    ),
)
async def get_export_download_url(
    export_id: UUID,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> SignedDownloadResponse:

    admin = (
        get_supabase_admin_client()
    )

    response = (
        admin.table(
            "exported_files"
        )
        .select(
            (
                "id, filename, "
                "storage_path"
            )
        )
        .eq(
            "id",
            str(export_id),
        )
        .eq(
            "user_id",
            str(current_user.id),
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail=(
                "Export file not found."
            ),
        )

    exported_file = (
        response.data[0]
    )

    try:
        signed_url = (
            storage_service
            .create_generated_download_url(
                storage_path=(
                    exported_file[
                        "storage_path"
                    ]
                ),
                expires_in=(
                    SIGNED_URL_EXPIRY_SECONDS
                ),
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not create secure "
                "download URL."
            ),
        ) from exc

    return SignedDownloadResponse(
        export_id=export_id,
        filename=(
            exported_file[
                "filename"
            ]
        ),
        signed_url=signed_url,
        expires_in=(
            SIGNED_URL_EXPIRY_SECONDS
        ),
    )


# ============================================================
# Delete one export
# ============================================================


@router.delete(
    "/files/{export_id}",
    response_model=DeleteResponse,
)
async def delete_export(
    export_id: UUID,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> DeleteResponse:

    admin = (
        get_supabase_admin_client()
    )

    response = (
        admin.table(
            "exported_files"
        )
        .select(
            "id, filename, storage_path"
        )
        .eq(
            "id",
            str(export_id),
        )
        .eq(
            "user_id",
            str(current_user.id),
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail=(
                "Export file not found."
            ),
        )

    exported_file = (
        response.data[0]
    )

    try:
        storage_service.delete_generated_output(
            exported_file[
                "storage_path"
            ]
        )

        (
            admin.table(
                "exported_files"
            )
            .delete()
            .eq(
                "id",
                str(export_id),
            )
            .eq(
                "user_id",
                str(current_user.id),
            )
            .execute()
        )

        (
            admin.table(
                "activity_events"
            )
            .insert(
                {
                    "user_id": str(
                        current_user.id
                    ),
                    "event_type": (
                        "export_deleted"
                    ),
                    "metadata": {
                        "export_id": str(
                            export_id
                        ),
                        "filename": (
                            exported_file[
                                "filename"
                            ]
                        ),
                    },
                }
            )
            .execute()
        )

        return DeleteResponse(
            id=export_id,
            status="deleted",
            message=(
                "Export file deleted."
            ),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Export deletion failed: "
                f"{exc}"
            ),
        ) from exc


# ============================================================
# List exports
# ============================================================


@router.get(
    "/{transformation_id}",
    response_model=(
        ExportListResponse
    ),
)
async def list_exports(
    transformation_id: UUID,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> ExportListResponse:

    admin = (
        get_supabase_admin_client()
    )

    transformation_response = (
        admin.table(
            "transformations"
        )
        .select("id")
        .eq(
            "id",
            str(
                transformation_id
            ),
        )
        .eq(
            "user_id",
            str(current_user.id),
        )
        .limit(1)
        .execute()
    )

    if not transformation_response.data:
        raise HTTPException(
            status_code=404,
            detail=(
                "Transformation not found."
            ),
        )

    response = (
        admin.table(
            "exported_files"
        )
        .select("*")
        .eq(
            "transformation_id",
            str(
                transformation_id
            ),
        )
        .eq(
            "user_id",
            str(current_user.id),
        )
        .order(
            "created_at",
            desc=True,
        )
        .execute()
    )

    artifacts: list[
        ExportArtifact
    ] = []

    for item in (
        response.data
        or []
    ):
        artifacts.append(
            ExportArtifact(
                id=UUID(
                    item["id"]
                ),
                transformation_id=(
                    transformation_id
                ),
                export_format=(
                    ExportFormat(
                        item[
                            "export_format"
                        ]
                    )
                ),
                filename=(
                    item[
                        "filename"
                    ]
                ),
                mime_type=(
                    item[
                        "mime_type"
                    ]
                ),
                file_size=int(
                    item.get(
                        "file_size"
                    )
                    or 0
                ),
                storage_path=(
                    item[
                        "storage_path"
                    ]
                ),
            )
        )

    return ExportListResponse(
        transformation_id=(
            transformation_id
        ),
        artifacts=artifacts,
    )