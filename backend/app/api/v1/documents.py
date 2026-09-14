from pathlib import (
    Path,
)

from uuid import (
    UUID,
    uuid4,
)

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)

from app.core.config import (
    settings,
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

from app.schemas.document import (
    DocumentUploadResponse,
)

from app.schemas.management import (
    DeleteResponse,
    DocumentDetailResponse,
    DocumentListResponse,
    TextDocumentCreateRequest,
)

from app.services.ingestion.document_parser import (
    document_parser,
)

from app.services.management.document_management import (
    document_management_service,
)

from app.services.security.upload_security import (
    UploadSecurityError,
    VIDEO_EXTENSIONS,
    validate_upload_file,
)

from app.services.storage.supabase_storage import (
    storage_service,
)

from app.services.video.video_parser import (
    video_parser,
)

from app.utils.files import (
    get_input_type,
    sanitize_filename,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


CHUNK_SIZE = (
    1024
    * 1024
)


def _resolve_input_type(
    filename: str,
) -> str:

    extension = (
        Path(
            filename
        )
        .suffix
        .lower()
    )


    if extension in (
        VIDEO_EXTENSIONS
    ):

        return "video"


    return get_input_type(
        filename
    )


async def _save_upload_to_temp(
    upload: UploadFile,
    destination: Path,
) -> int:

    total_size = 0

    max_size = (
        settings.max_upload_size_bytes
    )


    with destination.open(
        "wb"
    ) as output:

        while True:

            chunk = await upload.read(
                CHUNK_SIZE
            )


            if not chunk:

                break


            total_size += len(
                chunk
            )


            if total_size > max_size:

                output.close()

                destination.unlink(
                    missing_ok=True
                )


                raise HTTPException(
                    status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                    detail=(
                        "File exceeds maximum "
                        f"upload size of "
                        f"{settings.max_upload_size_mb} MB."
                    ),
                )


            output.write(
                chunk
            )


    await upload.close()


    if total_size <= 0:

        destination.unlink(
            missing_ok=True
        )


        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded file is empty."
            ),
        )


    return total_size


@router.post(
    "/upload",
    response_model=(
        DocumentUploadResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
async def upload_document(
    file: UploadFile = File(...),

    ocr_language: str = Form(
        default="en"
    ),

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> DocumentUploadResponse:

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded file has no filename."
            ),
        )


    safe_filename = (
        sanitize_filename(
            file.filename
        )
    )


    try:

        input_type = (
            _resolve_input_type(
                safe_filename
            )
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=415,
            detail=str(
                exc
            ),
        ) from exc


    document_id = (
        uuid4()
    )


    temp_directory = Path(
        settings.temp_directory
    )


    temp_directory.mkdir(
        parents=True,
        exist_ok=True,
    )


    temporary_path = (
        temp_directory
        / (
            f"{document_id}_"
            f"{safe_filename}"
        )
    )


    storage_path = (
        f"{current_user.id}"
        f"/sources/"
        f"{document_id}/"
        f"{safe_filename}"
    )


    admin = (
        get_supabase_admin_client()
    )


    database_record_created = (
        False
    )

    storage_uploaded = (
        False
    )


    try:

        file_size = (
            await _save_upload_to_temp(
                file,
                temporary_path,
            )
        )


        try:

            validation = (
                validate_upload_file(
                    file_path=(
                        temporary_path
                    ),

                    original_filename=(
                        safe_filename
                    ),

                    declared_mime_type=(
                        file.content_type
                    ),
                )
            )

        except UploadSecurityError as exc:

            raise HTTPException(
                status_code=415,
                detail=str(
                    exc
                ),
            ) from exc


        validated_mime_type = (
            validation.detected_mime_type
        )


        (
            admin.table(
                "source_documents"
            )
            .insert(
                {
                    "id":
                        str(
                            document_id
                        ),

                    "user_id":
                        str(
                            current_user.id
                        ),

                    "original_filename":
                        safe_filename,

                    "mime_type":
                        validated_mime_type,

                    "file_size":
                        file_size,

                    "input_type":
                        input_type,

                    "storage_path":
                        storage_path,

                    "status":
                        "processing",

                    "metadata": {
                        "original_client_filename":
                            file.filename,

                        "ocr_language":
                            ocr_language,

                        "validated_mime_type":
                            validated_mime_type,
                    },
                }
            )
            .execute()
        )


        database_record_created = (
            True
        )


        storage_service.upload_source_document(
            local_path=(
                temporary_path
            ),

            storage_path=(
                storage_path
            ),

            mime_type=(
                validated_mime_type
            ),
        )


        storage_uploaded = (
            True
        )


        # ====================================================
        # VIDEO PIPELINE
        # ====================================================

        if (
            input_type
            == "video"
        ):

            extraction = (
                await video_parser.parse(
                    file_path=(
                        temporary_path
                    ),

                    mime_type=(
                        validated_mime_type
                    ),
                )
            )


        # ====================================================
        # EXISTING DOCUMENT / IMAGE PIPELINE
        # ====================================================

        else:

            extraction = (
                await document_parser.parse(
                    file_path=(
                        temporary_path
                    ),

                    original_filename=(
                        safe_filename
                    ),

                    mime_type=(
                        validated_mime_type
                    ),

                    ocr_language=(
                        ocr_language
                    ),
                )
            )


        (
            admin.table(
                "source_documents"
            )
            .update(
                {
                    "status":
                        "ready",

                    "extraction_method":
                        extraction.extraction_method,

                    "page_count":
                        extraction.page_count,

                    "character_count":
                        extraction.character_count,

                    "extracted_text":
                        extraction.text,

                    "metadata": {
                        **(
                            extraction.metadata
                            or {}
                        ),

                        "validated_mime_type":
                            validated_mime_type,

                        "ocr_language":
                            ocr_language,

                        "extraction_method":
                            extraction.extraction_method,

                        "page_count":
                            extraction.page_count,
                    },

                    "error_message":
                        None,
                }
            )
            .eq(
                "id",
                str(
                    document_id
                ),
            )
            .eq(
                "user_id",
                str(
                    current_user.id
                ),
            )
            .execute()
        )


        (
            admin.table(
                "activity_events"
            )
            .insert(
                {
                    "user_id":
                        str(
                            current_user.id
                        ),

                    "event_type":
                        "document_uploaded",

                    "source_document_id":
                        str(
                            document_id
                        ),

                    "metadata": {
                        "filename":
                            safe_filename,

                        "input_type":
                            input_type,

                        "file_size":
                            file_size,

                        "mime_type":
                            validated_mime_type,

                        "character_count":
                            extraction.character_count,

                        "extraction_method":
                            extraction.extraction_method,
                    },
                }
            )
            .execute()
        )


        return DocumentUploadResponse(
            document_id=(
                document_id
            ),

            filename=(
                safe_filename
            ),

            input_type=(
                input_type
            ),

            mime_type=(
                validated_mime_type
            ),

            file_size=(
                file_size
            ),

            status=(
                "ready"
            ),

            storage_path=(
                storage_path
            ),

            extraction_method=(
                extraction.extraction_method
            ),

            page_count=(
                extraction.page_count
            ),

            character_count=(
                extraction.character_count
            ),

            text_preview=(
                extraction.text[
                    :1200
                ]
            ),

            metadata=(
                extraction.metadata
                or {}
            ),
        )


    except HTTPException:

        raise


    except Exception as exc:

        if storage_uploaded:

            try:

                storage_service.delete_source_document(
                    storage_path
                )

            except Exception:

                pass


        if database_record_created:

            try:

                (
                    admin.table(
                        "source_documents"
                    )
                    .update(
                        {
                            "status":
                                "failed",

                            "storage_path":
                                None,

                            "error_message":
                                str(
                                    exc
                                )[:2000],
                        }
                    )
                    .eq(
                        "id",
                        str(
                            document_id
                        ),
                    )
                    .eq(
                        "user_id",
                        str(
                            current_user.id
                        ),
                    )
                    .execute()
                )

            except Exception:

                pass


        raise HTTPException(
            status_code=500,
            detail=(
                "Document processing failed."
            ),
        ) from exc


    finally:

        temporary_path.unlink(
            missing_ok=True
        )


@router.post(
    "/text",
    response_model=(
        DocumentDetailResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
async def create_text_document(
    request:
        TextDocumentCreateRequest,

    current_user:
        AuthenticatedUser = Depends(
            get_current_user
        ),
) -> DocumentDetailResponse:

    try:

        return (
            document_management_service
            .create_text_document(
                user_id=(
                    current_user.id
                ),

                request=(
                    request
                ),
            )
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not create "
                "text document."
            ),
        ) from exc


@router.get(
    "",
    response_model=(
        DocumentListResponse
    ),
)
async def list_documents(
    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    status_filter:
        str | None = Query(
            default=None,
            alias="status",
        ),

    input_type:
        str | None = Query(
            default=None,
        ),

    search:
        str | None = Query(
            default=None,
            max_length=150,
        ),

    current_user:
        AuthenticatedUser = Depends(
            get_current_user
        ),
) -> DocumentListResponse:

    return (
        document_management_service
        .list_documents(
            user_id=(
                current_user.id
            ),

            page=(
                page
            ),

            page_size=(
                page_size
            ),

            status=(
                status_filter
            ),

            input_type=(
                input_type
            ),

            search=(
                search
            ),
        )
    )


@router.get(
    "/{document_id}",
    response_model=(
        DocumentDetailResponse
    ),
)
async def get_document(
    document_id:
        UUID,

    current_user:
        AuthenticatedUser = Depends(
            get_current_user
        ),
) -> DocumentDetailResponse:

    try:

        return (
            document_management_service
            .get_document(
                document_id=(
                    document_id
                ),

                user_id=(
                    current_user.id
                ),
            )
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(
                exc
            ),
        ) from exc


@router.delete(
    "/{document_id}",
    response_model=(
        DeleteResponse
    ),
)
async def delete_document(
    document_id:
        UUID,

    current_user:
        AuthenticatedUser = Depends(
            get_current_user
        ),
) -> DeleteResponse:

    try:

        await (
            document_management_service
            .delete_document(
                document_id=(
                    document_id
                ),

                user_id=(
                    current_user.id
                ),
            )
        )


        return DeleteResponse(
            id=(
                document_id
            ),

            status=(
                "deleted"
            ),

            message=(
                "Document and its derived "
                "resources were deleted."
            ),
        )


    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(
                exc
            ),
        ) from exc


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Document deletion failed."
            ),
        ) from exc