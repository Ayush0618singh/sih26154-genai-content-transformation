import math
from uuid import (
    UUID,
    uuid4,
)

from app.core.supabase import (
    get_supabase_admin_client,
)
from app.schemas.management import (
    DocumentDetailResponse,
    DocumentListItem,
    DocumentListResponse,
    PaginationMeta,
    TextDocumentCreateRequest,
)
from app.services.rag.chroma_service import (
    chroma_service,
)
from app.services.storage.supabase_storage import (
    storage_service,
)
from app.utils.files import (
    sanitize_filename,
)


class DocumentManagementService:

    def __init__(self) -> None:
        self.admin = (
            get_supabase_admin_client()
        )

    # ========================================================
    # LIST
    # ========================================================

    def list_documents(
        self,
        user_id: UUID,
        page: int,
        page_size: int,
        status: str | None = None,
        input_type: str | None = None,
        search: str | None = None,
    ) -> DocumentListResponse:

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

        if input_type:
            query = query.eq(
                "input_type",
                input_type,
            )

        if search:
            query = query.ilike(
                "original_filename",
                f"%{search}%",
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

        items = [
            DocumentListItem(
                **item
            )
            for item
            in (
                response.data
                or []
            )
        ]

        return DocumentListResponse(
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

    def get_document(
        self,
        document_id: UUID,
        user_id: UUID,
    ) -> DocumentDetailResponse:

        response = (
            self.admin.table(
                "source_documents"
            )
            .select("*")
            .eq(
                "id",
                str(document_id),
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
                "Document not found."
            )

        document = response.data[
            0
        ]

        rag_response = (
            self.admin.table(
                "rag_indexes"
            )
            .select(
                "status, chunk_count"
            )
            .eq(
                "source_document_id",
                str(document_id),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .limit(1)
            .execute()
        )

        rag_status: str | None = None
        rag_chunk_count = 0

        if rag_response.data:
            rag_record = (
                rag_response.data[0]
            )

            rag_status = (
                rag_record.get(
                    "status"
                )
            )

            rag_chunk_count = int(
                rag_record.get(
                    "chunk_count"
                )
                or 0
            )

        transformation_response = (
            self.admin.table(
                "transformations"
            )
            .select(
                "id",
                count="exact",
            )
            .eq(
                "source_document_id",
                str(document_id),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .execute()
        )

        transformation_count = int(
            transformation_response.count
            or 0
        )

        return DocumentDetailResponse(
            **document,
            rag_status=rag_status,
            rag_chunk_count=(
                rag_chunk_count
            ),
            transformation_count=(
                transformation_count
            ),
        )

    # ========================================================
    # DIRECT TEXT INPUT
    # ========================================================

    def create_text_document(
        self,
        user_id: UUID,
        request: TextDocumentCreateRequest,
    ) -> DocumentDetailResponse:

        document_id = uuid4()

        filename = sanitize_filename(
            f"{request.title}.txt"
        )

        content = (
            request.content.strip()
        )

        record = {
            "id": str(
                document_id
            ),
            "user_id": str(
                user_id
            ),
            "original_filename": (
                filename
            ),
            "mime_type": (
                "text/plain"
            ),
            "file_size": len(
                content.encode(
                    "utf-8"
                )
            ),
            "input_type": "text",
            "storage_path": None,
            "status": "ready",
            "extraction_method": (
                "direct_text_input"
            ),
            "page_count": 1,
            "character_count": len(
                content
            ),
            "extracted_text": (
                content
            ),
            "metadata": {
                "source": (
                    "direct_text_input"
                ),
                "language": (
                    request.language
                ),
                "provided_title": (
                    request.title
                ),
            },
            "error_message": None,
        }

        response = (
            self.admin.table(
                "source_documents"
            )
            .insert(
                record
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Could not create "
                "text document."
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
                        "text_document_created"
                    ),
                    "source_document_id": (
                        str(
                            document_id
                        )
                    ),
                    "metadata": {
                        "filename": (
                            filename
                        ),
                        "character_count": (
                            len(
                                content
                            )
                        ),
                    },
                }
            )
            .execute()
        )

        return self.get_document(
            document_id,
            user_id,
        )

    # ========================================================
    # DELETE
    # ========================================================

    async def delete_document(
        self,
        document_id: UUID,
        user_id: UUID,
    ) -> None:

        response = (
            self.admin.table(
                "source_documents"
            )
            .select(
                "id, original_filename, "
                "storage_path"
            )
            .eq(
                "id",
                str(document_id),
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
                "Document not found."
            )

        document = response.data[
            0
        ]

        transformations_response = (
            self.admin.table(
                "transformations"
            )
            .select("id")
            .eq(
                "source_document_id",
                str(document_id),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .execute()
        )

        transformation_ids = [
            item["id"]
            for item in (
                transformations_response.data
                or []
            )
        ]

        # ----------------------------------------------------
        # Delete physical export files first
        # ----------------------------------------------------

        if transformation_ids:
            exports_response = (
                self.admin.table(
                    "exported_files"
                )
                .select(
                    "storage_path"
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
        # Delete transformations
        # generated_outputs/exported_files cascade in DB
        # ----------------------------------------------------

        if transformation_ids:
            (
                self.admin.table(
                    "transformations"
                )
                .delete()
                .eq(
                    "user_id",
                    str(user_id),
                )
                .in_(
                    "id",
                    transformation_ids,
                )
                .execute()
            )

        # ----------------------------------------------------
        # Delete Chroma collection
        # ----------------------------------------------------

        collection_name = (
            chroma_service
            .collection_name_for_document(
                str(document_id)
            )
        )

        await (
            chroma_service
            .delete_collection(
                collection_name
            )
        )

        # ----------------------------------------------------
        # Delete original source file
        # ----------------------------------------------------

        source_storage_path = (
            document.get(
                "storage_path"
            )
        )

        if source_storage_path:
            try:
                storage_service.delete_source_document(
                    source_storage_path
                )

            except Exception:
                pass

        # ----------------------------------------------------
        # Delete source DB record last
        # ----------------------------------------------------

        (
            self.admin.table(
                "source_documents"
            )
            .delete()
            .eq(
                "id",
                str(document_id),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .execute()
        )

        # ----------------------------------------------------
        # Activity record without FK to deleted document
        # ----------------------------------------------------

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
                        "document_deleted"
                    ),
                    "metadata": {
                        "document_id": str(
                            document_id
                        ),
                        "filename": (
                            document[
                                "original_filename"
                            ]
                        ),
                    },
                }
            )
            .execute()
        )


document_management_service = (
    DocumentManagementService()
)