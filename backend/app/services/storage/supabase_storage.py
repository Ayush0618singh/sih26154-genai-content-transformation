from pathlib import Path
from typing import Any

from app.core.config import settings
from app.core.supabase import (
    get_supabase_admin_client,
)


class SupabaseStorageService:

    def __init__(self) -> None:
        self.client = (
            get_supabase_admin_client()
        )

    def _upload_file(
        self,
        bucket: str,
        local_path: Path,
        storage_path: str,
        mime_type: str,
    ) -> None:
        with local_path.open(
            "rb"
        ) as file:
            self.client.storage.from_(
                bucket
            ).upload(
                path=storage_path,
                file=file,
                file_options={
                    "content-type": (
                        mime_type
                    ),
                    "cache-control": (
                        "3600"
                    ),
                    "upsert": "false",
                },
            )

    def _delete_file(
        self,
        bucket: str,
        storage_path: str,
    ) -> None:
        self.client.storage.from_(
            bucket
        ).remove(
            [
                storage_path,
            ]
        )

    def upload_source_document(
        self,
        local_path: Path,
        storage_path: str,
        mime_type: str,
    ) -> None:
        self._upload_file(
            bucket=(
                settings
                .supabase_document_bucket
            ),
            local_path=local_path,
            storage_path=storage_path,
            mime_type=mime_type,
        )

    def delete_source_document(
        self,
        storage_path: str,
    ) -> None:
        self._delete_file(
            bucket=(
                settings
                .supabase_document_bucket
            ),
            storage_path=storage_path,
        )

    def upload_generated_output(
        self,
        local_path: Path,
        storage_path: str,
        mime_type: str,
    ) -> None:
        self._upload_file(
            bucket=(
                settings
                .supabase_output_bucket
            ),
            local_path=local_path,
            storage_path=storage_path,
            mime_type=mime_type,
        )

    def delete_generated_output(
        self,
        storage_path: str,
    ) -> None:
        self._delete_file(
            bucket=(
                settings
                .supabase_output_bucket
            ),
            storage_path=storage_path,
        )

    def create_generated_download_url(
        self,
        storage_path: str,
        expires_in: int = 900,
    ) -> str:
        response = (
            self.client.storage
            .from_(
                settings
                .supabase_output_bucket
            )
            .create_signed_url(
                storage_path,
                expires_in,
                {
                    "download": True,
                },
            )
        )

        if isinstance(
            response,
            dict,
        ):
            url = (
                response.get(
                    "signedURL"
                )
                or response.get(
                    "signedUrl"
                )
                or response.get(
                    "signed_url"
                )
            )

            if url:
                return str(
                    url
                )

            data = response.get(
                "data"
            )

            if isinstance(
                data,
                dict,
            ):
                url = (
                    data.get(
                        "signedURL"
                    )
                    or data.get(
                        "signedUrl"
                    )
                    or data.get(
                        "signed_url"
                    )
                )

                if url:
                    return str(
                        url
                    )

        data: Any = getattr(
            response,
            "data",
            None,
        )

        if isinstance(
            data,
            dict,
        ):
            url = (
                data.get(
                    "signedURL"
                )
                or data.get(
                    "signedUrl"
                )
                or data.get(
                    "signed_url"
                )
            )

            if url:
                return str(
                    url
                )

        raise RuntimeError(
            "Supabase did not return "
            "a signed URL."
        )


storage_service = (
    SupabaseStorageService()
)