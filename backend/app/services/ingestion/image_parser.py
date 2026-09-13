from pathlib import Path

from PIL import Image

from app.schemas.document import (
    DocumentExtractionResult,
    ExtractedPage,
)
from app.services.ai.gemini_service import (
    gemini_service,
)
from app.services.ocr.paddle_service import (
    paddle_ocr_service,
)


MINIMUM_USEFUL_OCR_CHARACTERS = 20


async def parse_image_document(
    file_path: Path,
    filename: str,
    mime_type: str,
    ocr_language: str = "en",
) -> DocumentExtractionResult:

    with Image.open(
        file_path
    ) as image:

        width, height = image.size

        image_format = (
            image.format
            or "unknown"
        )

    ocr_text = ""

    confidence: float | None = None

    extraction_method = (
        "paddle_ocr"
    )

    try:

        (
            ocr_text,
            confidence,
        ) = (
            await paddle_ocr_service.extract_text(
                file_path,
                language=ocr_language,
            )
        )

    except Exception:

        ocr_text = ""

        confidence = None

    final_text = (
        ocr_text.strip()
    )

    if (
        len(final_text)
        < MINIMUM_USEFUL_OCR_CHARACTERS
        and gemini_service.configured
    ):

        vision_text = (
            await gemini_service.analyse_image(
                file_path,
                (
                    "Extract and describe all useful "
                    "content from this image. "
                    "Preserve visible text accurately. "
                    "If it contains a chart, table, "
                    "diagram, document, infographic, "
                    "or visual evidence, explain its "
                    "important information. "
                    "Do not invent information that is "
                    "not visible."
                ),
            )
        )

        if vision_text.strip():

            final_text = (
                vision_text.strip()
            )

            extraction_method = (
                "gemini_vision"
            )

    page = ExtractedPage(
        page_number=1,
        text=final_text,
        character_count=len(
            final_text
        ),
        used_ocr=(
            extraction_method
            == "paddle_ocr"
        ),
    )

    return DocumentExtractionResult(
        filename=filename,
        document_type="image",
        mime_type=mime_type,
        extraction_method=(
            extraction_method
        ),
        page_count=1,
        character_count=len(
            final_text
        ),
        text=final_text,
        pages=[
            page,
        ],
        metadata={
            "width": width,
            "height": height,
            "image_format": (
                image_format
            ),
            "ocr_language": (
                ocr_language
            ),
            "ocr_confidence": (
                confidence
            ),
        },
    )