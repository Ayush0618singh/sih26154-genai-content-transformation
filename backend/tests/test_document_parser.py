from pathlib import Path

import pytest

from app.services.ingestion.document_parser import (
    document_parser,
)


@pytest.mark.asyncio
async def test_text_document_parser(
    tmp_path: Path,
) -> None:

    sample_file = (
        tmp_path
        / "sample.txt"
    )

    sample_text = (
        "SIH26154 GenAI Content "
        "Transformation Test"
    )

    sample_file.write_text(
        sample_text,
        encoding="utf-8",
    )

    result = await document_parser.parse(
        file_path=sample_file,
        original_filename="sample.txt",
        mime_type="text/plain",
    )

    assert (
        result.document_type
        == "text"
    )

    assert (
        result.text
        == sample_text
    )

    assert (
        result.character_count
        == len(sample_text)
    )

    assert (
        result.extraction_method
        == "native_text"
    )