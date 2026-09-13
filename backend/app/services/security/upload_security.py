from __future__ import annotations

import zipfile

from dataclasses import dataclass

from pathlib import Path

import filetype


# ============================================================
# Limits
# ============================================================


MAX_ARCHIVE_MEMBERS = 5_000

MAX_ARCHIVE_UNCOMPRESSED_BYTES = (
    250
    * 1024
    * 1024
)

MAX_MEMBER_EXPANSION_RATIO = 200.0


# ============================================================
# Supported file types
# ============================================================


TEXT_EXTENSIONS = {
    ".txt",
    ".md",
    ".csv",
    ".json",
}


IMAGE_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/bmp",
    "image/tiff",
}


IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff",
}


OOXML_MIME_TYPES = {
    ".docx": (
        "application/vnd.openxmlformats-officedocument."
        "wordprocessingml.document"
    ),

    ".xlsx": (
        "application/vnd.openxmlformats-officedocument."
        "spreadsheetml.sheet"
    ),
}


NORMALIZED_TEXT_MIME_TYPES = {
    ".txt":
        "text/plain",

    ".md":
        "text/markdown",

    ".csv":
        "text/csv",

    ".json":
        "application/json",
}


# ============================================================
# Result
# ============================================================


@dataclass(
    frozen=True
)
class UploadValidationResult:
    extension: str

    detected_mime_type: str


# ============================================================
# Exception
# ============================================================


class UploadSecurityError(
    ValueError
):
    pass


# ============================================================
# Helpers
# ============================================================


def _read_prefix(
    file_path: Path,
    size: int = 65_536,
) -> bytes:

    with file_path.open(
        "rb"
    ) as file:
        return file.read(
            size
        )


def _reject_executable_signatures(
    prefix: bytes,
) -> None:

    # Windows PE
    if prefix.startswith(
        b"MZ"
    ):
        raise UploadSecurityError(
            "Executable files are not allowed."
        )

    # Linux ELF
    if prefix.startswith(
        b"\x7fELF"
    ):
        raise UploadSecurityError(
            "Executable files are not allowed."
        )

    # Mach-O signatures
    macho_signatures = {
        b"\xfe\xed\xfa\xce",
        b"\xfe\xed\xfa\xcf",
        b"\xce\xfa\xed\xfe",
        b"\xcf\xfa\xed\xfe",
    }

    if prefix[:4] in macho_signatures:
        raise UploadSecurityError(
            "Executable files are not allowed."
        )


def _validate_text_like(
    file_path: Path,
) -> None:

    prefix = _read_prefix(
        file_path
    )

    if b"\x00" in prefix:
        raise UploadSecurityError(
            "The uploaded text file appears "
            "to contain binary data."
        )


def _safe_archive_name(
    name: str,
) -> bool:

    normalized = (
        name.replace(
            "\\",
            "/",
        )
    )

    if normalized.startswith(
        "/"
    ):
        return False

    parts = [
        part
        for part
        in normalized.split(
            "/"
        )
        if part
    ]

    return ".." not in parts


def _validate_ooxml_archive(
    file_path: Path,
    extension: str,
) -> None:

    if not zipfile.is_zipfile(
        file_path
    ):
        raise UploadSecurityError(
            f"{extension} file is not "
            "a valid Office archive."
        )

    total_uncompressed = 0

    try:
        with zipfile.ZipFile(
            file_path,
            "r",
        ) as archive:

            members = (
                archive.infolist()
            )

            if len(
                members
            ) > MAX_ARCHIVE_MEMBERS:
                raise UploadSecurityError(
                    "Office archive contains "
                    "too many entries."
                )


            member_names: set[
                str
            ] = set()


            for member in members:

                member_names.add(
                    member.filename
                )


                if not _safe_archive_name(
                    member.filename
                ):
                    raise UploadSecurityError(
                        "Unsafe archive path detected."
                    )


                if (
                    member.flag_bits
                    & 0x1
                ):
                    raise UploadSecurityError(
                        "Encrypted Office archives "
                        "are not supported."
                    )


                if member.is_dir():
                    continue


                total_uncompressed += (
                    member.file_size
                )


                if (
                    total_uncompressed
                    > MAX_ARCHIVE_UNCOMPRESSED_BYTES
                ):
                    raise UploadSecurityError(
                        "Office archive expands "
                        "beyond the allowed limit."
                    )


                compressed_size = max(
                    member.compress_size,
                    1,
                )

                expansion_ratio = (
                    member.file_size
                    / compressed_size
                )


                if (
                    member.file_size
                    > 5 * 1024 * 1024
                    and expansion_ratio
                    > MAX_MEMBER_EXPANSION_RATIO
                ):
                    raise UploadSecurityError(
                        "Suspicious compression ratio "
                        "detected in Office archive."
                    )


            if (
                "[Content_Types].xml"
                not in member_names
            ):
                raise UploadSecurityError(
                    "Invalid Office document structure."
                )


            if extension == ".docx":

                if not any(
                    name.startswith(
                        "word/"
                    )
                    for name
                    in member_names
                ):
                    raise UploadSecurityError(
                        "The uploaded file is not "
                        "a valid DOCX document."
                    )


            elif extension == ".xlsx":

                if not any(
                    name.startswith(
                        "xl/"
                    )
                    for name
                    in member_names
                ):
                    raise UploadSecurityError(
                        "The uploaded file is not "
                        "a valid XLSX workbook."
                    )

    except zipfile.BadZipFile as exc:

        raise UploadSecurityError(
            "Invalid Office archive."
        ) from exc


# ============================================================
# Main validator
# ============================================================


def validate_upload_file(
    file_path: Path,
    original_filename: str,
    declared_mime_type: str | None,
) -> UploadValidationResult:

    del declared_mime_type

    extension = (
        Path(
            original_filename
        )
        .suffix
        .lower()
    )


    allowed_extensions = {
        ".pdf",
        ".docx",
        ".txt",
        ".md",
        ".json",
        ".csv",
        ".xlsx",
        *IMAGE_EXTENSIONS,
    }


    if extension not in allowed_extensions:
        raise UploadSecurityError(
            f"Unsupported file extension: "
            f"{extension or 'none'}"
        )


    prefix = _read_prefix(
        file_path
    )


    _reject_executable_signatures(
        prefix
    )


    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if extension == ".pdf":

        if not prefix.startswith(
            b"%PDF-"
        ):
            raise UploadSecurityError(
                "The uploaded file does not "
                "contain a valid PDF signature."
            )

        return UploadValidationResult(
            extension=extension,
            detected_mime_type=(
                "application/pdf"
            ),
        )


    # --------------------------------------------------------
    # DOCX / XLSX
    # --------------------------------------------------------

    if extension in (
        ".docx",
        ".xlsx",
    ):

        _validate_ooxml_archive(
            file_path,
            extension,
        )

        return UploadValidationResult(
            extension=extension,
            detected_mime_type=(
                OOXML_MIME_TYPES[
                    extension
                ]
            ),
        )


    # --------------------------------------------------------
    # Text-like
    # --------------------------------------------------------

    if extension in TEXT_EXTENSIONS:

        _validate_text_like(
            file_path
        )

        return UploadValidationResult(
            extension=extension,
            detected_mime_type=(
                NORMALIZED_TEXT_MIME_TYPES[
                    extension
                ]
            ),
        )


    # --------------------------------------------------------
    # Images
    # --------------------------------------------------------

    if extension in IMAGE_EXTENSIONS:

        detected = (
            filetype.guess(
                str(
                    file_path
                )
            )
        )

        if detected is None:
            raise UploadSecurityError(
                "Could not identify the uploaded image."
            )


        if (
            detected.mime
            not in IMAGE_MIME_TYPES
        ):
            raise UploadSecurityError(
                "The uploaded file content "
                "does not match a supported image type."
            )


        extension_mime_pairs = {
            ".png": {
                "image/png",
            },

            ".jpg": {
                "image/jpeg",
            },

            ".jpeg": {
                "image/jpeg",
            },

            ".webp": {
                "image/webp",
            },

            ".bmp": {
                "image/bmp",
            },

            ".tif": {
                "image/tiff",
            },

            ".tiff": {
                "image/tiff",
            },
        }


        if (
            detected.mime
            not in extension_mime_pairs[
                extension
            ]
        ):
            raise UploadSecurityError(
                "Image extension does not match "
                "the actual uploaded file type."
            )


        return UploadValidationResult(
            extension=extension,
            detected_mime_type=(
                detected.mime
            ),
        )


    raise UploadSecurityError(
        "Unsupported upload."
    )