import asyncio
import shutil
from pathlib import Path
from uuid import (
    UUID,
    uuid4,
)

from app.core.config import settings
from app.core.supabase import (
    get_supabase_admin_client,
)
from app.schemas.export import (
    ExportArtifact,
    ExportBatchResponse,
    ExportFormat,
    ExportRequest,
)
from app.services.generators.content_utils import (
    safe_file_stem,
)
from app.services.generators.registry import (
    FILE_EXTENSIONS,
    MIME_TYPES,
    generate_export_file,
)
from app.services.storage.supabase_storage import (
    storage_service,
)


SIGNED_URL_EXPIRY_SECONDS = 900


class ExportService:

    def __init__(self) -> None:
        self.admin = (
            get_supabase_admin_client()
        )

    def _get_transformation(
        self,
        transformation_id: UUID,
        user_id: UUID,
    ) -> dict:
        response = (
            self.admin.table(
                "transformations"
            )
            .select("*")
            .eq(
                "id",
                str(
                    transformation_id
                ),
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
                "Transformation not found."
            )

        transformation = (
            response.data[0]
        )

        if (
            transformation.get(
                "status"
            )
            != "completed"
        ):
            raise ValueError(
                "Only completed "
                "transformations can be exported."
            )

        return transformation

    def _get_outputs(
        self,
        transformation_id: UUID,
        user_id: UUID,
    ) -> list[dict]:
        response = (
            self.admin.table(
                "generated_outputs"
            )
            .select(
                "id, output_type, title, "
                "content_json, created_at"
            )
            .eq(
                "transformation_id",
                str(
                    transformation_id
                ),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .order(
                "created_at"
            )
            .execute()
        )

        return (
            response.data
            or []
        )

    @staticmethod
    def _filter_outputs(
        outputs: list[dict],
        request: ExportRequest,
    ) -> list[dict]:
        if (
            request.include_output_types
            is None
        ):
            return outputs

        allowed = {
            output_type.value
            for output_type
            in request.include_output_types
        }

        return [
            output
            for output in outputs
            if output.get(
                "output_type"
            )
            in allowed
        ]

    async def _generate_local_files(
        self,
        transformation: dict,
        outputs: list[dict],
        request: ExportRequest,
        work_directory: Path,
    ) -> list[
        tuple[
            ExportFormat,
            UUID,
            Path,
        ]
    ]:
        title = (
            transformation.get(
                "title"
            )
            or "transformation"
        )

        file_stem = safe_file_stem(
            title
        )

        generated: list[
            tuple[
                ExportFormat,
                UUID,
                Path,
            ]
        ] = []

        for export_format in (
            request.formats
        ):
            export_id = uuid4()

            extension = (
                FILE_EXTENSIONS[
                    export_format
                ]
            )

            filename = (
                f"{file_stem}-"
                f"{export_format.value}"
                f"{extension}"
            )

            destination = (
                work_directory
                / str(export_id)
                / filename
            )

            await asyncio.to_thread(
                generate_export_file,
                export_format,
                transformation,
                outputs,
                destination,
            )

            if not destination.exists():
                raise RuntimeError(
                    (
                        "Generator did not "
                        f"create {filename}."
                    )
                )

            if (
                destination.stat().st_size
                <= 0
            ):
                raise RuntimeError(
                    (
                        "Generated export "
                        f"{filename} is empty."
                    )
                )

            generated.append(
                (
                    export_format,
                    export_id,
                    destination,
                )
            )

        return generated

    async def generate_exports(
        self,
        transformation_id: UUID,
        user_id: UUID,
        request: ExportRequest,
    ) -> ExportBatchResponse:
        transformation = (
            self._get_transformation(
                transformation_id,
                user_id,
            )
        )

        outputs = self._get_outputs(
            transformation_id,
            user_id,
        )

        outputs = (
            self._filter_outputs(
                outputs,
                request,
            )
        )

        if not outputs:
            raise ValueError(
                "No generated outputs are "
                "available for export."
            )

        job_id = uuid4()

        work_directory = (
            Path(
                settings.generated_directory
            )
            / "exports"
            / str(user_id)
            / str(job_id)
        )

        work_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        uploaded_paths: list[
            str
        ] = []

        inserted_export_ids: list[
            str
        ] = []

        try:
            generated_files = (
                await self._generate_local_files(
                    transformation=(
                        transformation
                    ),
                    outputs=outputs,
                    request=request,
                    work_directory=(
                        work_directory
                    ),
                )
            )

            artifacts: list[
                ExportArtifact
            ] = []

            for (
                export_format,
                export_id,
                local_path,
            ) in generated_files:
                filename = (
                    local_path.name
                )

                mime_type = (
                    MIME_TYPES[
                        export_format
                    ]
                )

                file_size = (
                    local_path.stat()
                    .st_size
                )

                storage_path = (
                    f"{user_id}"
                    f"/transformations/"
                    f"{transformation_id}/"
                    f"{export_id}/"
                    f"{filename}"
                )

                storage_service.upload_generated_output(
                    local_path=(
                        local_path
                    ),
                    storage_path=(
                        storage_path
                    ),
                    mime_type=(
                        mime_type
                    ),
                )

                uploaded_paths.append(
                    storage_path
                )

                (
                    self.admin.table(
                        "exported_files"
                    )
                    .insert(
                        {
                            "id": str(
                                export_id
                            ),
                            "user_id": str(
                                user_id
                            ),
                            "transformation_id": (
                                str(
                                    transformation_id
                                )
                            ),
                            "export_format": (
                                export_format.value
                            ),
                            "filename": (
                                filename
                            ),
                            "mime_type": (
                                mime_type
                            ),
                            "file_size": (
                                file_size
                            ),
                            "storage_path": (
                                storage_path
                            ),
                            "metadata": {
                                "output_types": [
                                    output.get(
                                        "output_type"
                                    )
                                    for output
                                    in outputs
                                ]
                            },
                        }
                    )
                    .execute()
                )

                inserted_export_ids.append(
                    str(export_id)
                )

                signed_url: str | None = None

                try:
                    signed_url = (
                        storage_service
                        .create_generated_download_url(
                            storage_path=(
                                storage_path
                            ),
                            expires_in=(
                                SIGNED_URL_EXPIRY_SECONDS
                            ),
                        )
                    )

                except Exception:
                    signed_url = None

                artifacts.append(
                    ExportArtifact(
                        id=export_id,
                        transformation_id=(
                            transformation_id
                        ),
                        export_format=(
                            export_format
                        ),
                        filename=filename,
                        mime_type=(
                            mime_type
                        ),
                        file_size=(
                            file_size
                        ),
                        storage_path=(
                            storage_path
                        ),
                        signed_url=(
                            signed_url
                        ),
                        expires_in=(
                            SIGNED_URL_EXPIRY_SECONDS
                            if signed_url
                            else None
                        ),
                    )
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
                            "exports_generated"
                        ),
                        "transformation_id": (
                            str(
                                transformation_id
                            )
                        ),
                        "metadata": {
                            "formats": [
                                item.value
                                for item
                                in request.formats
                            ],
                            "artifact_count": (
                                len(
                                    artifacts
                                )
                            ),
                        },
                    }
                )
                .execute()
            )

            return ExportBatchResponse(
                transformation_id=(
                    transformation_id
                ),
                artifacts=artifacts,
            )

        except Exception:
            for export_id in (
                inserted_export_ids
            ):
                try:
                    (
                        self.admin.table(
                            "exported_files"
                        )
                        .delete()
                        .eq(
                            "id",
                            export_id,
                        )
                        .eq(
                            "user_id",
                            str(user_id),
                        )
                        .execute()
                    )
                except Exception:
                    pass

            for storage_path in (
                uploaded_paths
            ):
                try:
                    storage_service.delete_generated_output(
                        storage_path
                    )

                except Exception:
                    pass

            raise

        finally:
            shutil.rmtree(
                work_directory,
                ignore_errors=True,
            )


export_service = ExportService()