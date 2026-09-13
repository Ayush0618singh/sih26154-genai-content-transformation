from pathlib import (
    Path,
)

from types import (
    SimpleNamespace,
)

import pytest

from app.services.security import (
    upload_security,
)

from app.services.security.upload_security import (
    UploadSecurityError,
    validate_upload_file,
)


def test_mp4_is_accepted_when_content_matches(
    tmp_path: Path,
    monkeypatch,
):

    file_path = (
        tmp_path
        / "sample.mp4"
    )


    file_path.write_bytes(
        b"\x00\x00\x00\x18ftypisom"
        + b"\x00" * 100
    )


    monkeypatch.setattr(
        upload_security.filetype,
        "guess",
        lambda _: (
            SimpleNamespace(
                mime=(
                    "video/mp4"
                )
            )
        ),
    )


    result = (
        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "sample.mp4"
            ),

            declared_mime_type=(
                "video/mp4"
            ),
        )
    )


    assert (
        result.detected_mime_type
        == "video/mp4"
    )


def test_mov_is_normalized_for_gemini(
    tmp_path: Path,
    monkeypatch,
):

    file_path = (
        tmp_path
        / "sample.mov"
    )


    file_path.write_bytes(
        b"\x00\x00\x00\x14ftypqt  "
        + b"\x00" * 100
    )


    monkeypatch.setattr(
        upload_security.filetype,
        "guess",
        lambda _: (
            SimpleNamespace(
                mime=(
                    "video/quicktime"
                )
            )
        ),
    )


    result = (
        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "sample.mov"
            ),

            declared_mime_type=(
                "video/quicktime"
            ),
        )
    )


    assert (
        result.detected_mime_type
        == "video/mov"
    )


def test_video_extension_mismatch_is_rejected(
    tmp_path: Path,
    monkeypatch,
):

    file_path = (
        tmp_path
        / "fake.webm"
    )


    file_path.write_bytes(
        b"\x00" * 100
    )


    monkeypatch.setattr(
        upload_security.filetype,
        "guess",
        lambda _: (
            SimpleNamespace(
                mime=(
                    "video/mp4"
                )
            )
        ),
    )


    with pytest.raises(
        UploadSecurityError
    ):

        validate_upload_file(
            file_path=(
                file_path
            ),

            original_filename=(
                "fake.webm"
            ),

            declared_mime_type=(
                "video/webm"
            ),
        )