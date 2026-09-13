import json
from pathlib import Path

from app.schemas.document import (
    DocumentExtractionResult,
    ExtractedPage,
)


async def parse_text_document(
    file_path: Path,
    filename: str,
    mime_type: str,
    document_type: str = "text",
) -> DocumentExtractionResult:

    raw_text = file_path.read_text(
        encoding="utf-8",
        errors="replace",
    )

    if document_type == "json":

        try:
            json_data = json.loads(
                raw_text
            )

            text = json.dumps(
                json_data,
                indent=2,
                ensure_ascii=False,
            )

        except json.JSONDecodeError:
            text = raw_text

    else:
        text = raw_text

    text = text.strip()

    page = ExtractedPage(
        page_number=1,
        text=text,
        character_count=len(text),
        used_ocr=False,
    )

    return DocumentExtractionResult(
        filename=filename,
        document_type=document_type,
        mime_type=mime_type,
        extraction_method="native_text",
        page_count=1,
        character_count=len(text),
        text=text,
        pages=[
            page,
        ],
        metadata={},
    )