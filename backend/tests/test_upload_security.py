import zipfile

from pathlib import (
    Path,
)

import pytest

from app.services.security.upload_security import (
    UploadSecurityError,
    validate_upload_file,
)


def test_valid_text_file(
    tmp_path: Path,
) -> None:

    file_path = (
        tmp_path
        / "report.txt"
    )

    file_path.write_text(
        (
            "This is a legitimate "
            "text document."
        ),
        encoding="utf-8",
    )


    result = (
        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "report.txt"
            ),

            declared_mime_type=(
                "text/plain"
            ),
        )
    )


    assert (
        result.detected_mime_type
        == "text/plain"
    )


def test_disguised_executable_rejected(
    tmp_path: Path,
) -> None:

    file_path = (
        tmp_path
        / "fake.pdf"
    )


    file_path.write_bytes(
        b"MZ"
        + b"\x00" * 100
    )


    with pytest.raises(
        UploadSecurityError
    ):

        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "fake.pdf"
            ),

            declared_mime_type=(
                "application/pdf"
            ),
        )


def test_invalid_pdf_signature_rejected(
    tmp_path: Path,
) -> None:

    file_path = (
        tmp_path
        / "fake.pdf"
    )


    file_path.write_bytes(
        b"This is not a PDF."
    )


    with pytest.raises(
        UploadSecurityError
    ):

        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "fake.pdf"
            ),

            declared_mime_type=(
                "application/pdf"
            ),
        )


def test_valid_pdf_signature(
    tmp_path: Path,
) -> None:

    file_path = (
        tmp_path
        / "sample.pdf"
    )


    file_path.write_bytes(
        (
            b"%PDF-1.7\n"
            b"% test\n"
        )
    )


    result = (
        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "sample.pdf"
            ),

            declared_mime_type=(
                "application/pdf"
            ),
        )
    )


    assert (
        result.detected_mime_type
        == "application/pdf"
    )


def test_valid_minimal_docx_structure(
    tmp_path: Path,
) -> None:

    file_path = (
        tmp_path
        / "sample.docx"
    )


    with zipfile.ZipFile(
        file_path,
        "w",
    ) as archive:

        archive.writestr(
            "[Content_Types].xml",
            "<Types />",
        )

        archive.writestr(
            "word/document.xml",
            "<document />",
        )


    result = (
        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "sample.docx"
            ),

            declared_mime_type=(
                "application/octet-stream"
            ),
        )
    )


    assert (
        result.detected_mime_type
        ==
        (
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        )
    )


def test_fake_docx_rejected(
    tmp_path: Path,
) -> None:

    file_path = (
        tmp_path
        / "fake.docx"
    )


    with zipfile.ZipFile(
        file_path,
        "w",
    ) as archive:

        archive.writestr(
            "random.txt",
            "not docx",
        )


    with pytest.raises(
        UploadSecurityError
    ):

        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "fake.docx"
            ),

            declared_mime_type=(
                "application/octet-stream"
            ),
        )