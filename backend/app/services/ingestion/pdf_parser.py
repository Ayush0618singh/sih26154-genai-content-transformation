from pathlib import Path
from tempfile import NamedTemporaryFile

import pymupdf

from app.schemas.document import (
    DocumentExtractionResult,
    ExtractedPage,
)
from app.services.ocr.paddle_service import (
    paddle_ocr_service,
)


MIN_NATIVE_TEXT_CHARACTERS = 40

PDF_OCR_DPI = 200


async def parse_pdf_document(
    file_path: Path,
    filename: str,
    mime_type: str,
    ocr_language: str = "en",
) -> DocumentExtractionResult:

    document = pymupdf.open(
        str(file_path)
    )

    extracted_pages: list[
        ExtractedPage
    ] = []

    methods_used: set[str] = set()

    try:

        for page_index in range(
            document.page_count
        ):

            page = document.load_page(
                page_index
            )

            native_text = (
                page.get_text(
                    "text",
                    sort=True,
                )
                or ""
            ).strip()

            page_text = native_text

            used_ocr = False

            if (
                len(native_text)
                < MIN_NATIVE_TEXT_CHARACTERS
            ):

                temporary_image_path: (
                    Path | None
                ) = None

                try:

                    pixmap = (
                        page.get_pixmap(
                            dpi=PDF_OCR_DPI,
                            alpha=False,
                        )
                    )

                    with (
                        NamedTemporaryFile(
                            suffix=".png",
                            delete=False,
                        )
                    ) as temporary_file:

                        temporary_image_path = (
                            Path(
                                temporary_file.name
                            )
                        )

                    pixmap.save(
                        str(
                            temporary_image_path
                        )
                    )

                    (
                        ocr_text,
                        _,
                    ) = (
                        await paddle_ocr_service.extract_text(
                            temporary_image_path,
                            language=(
                                ocr_language
                            ),
                        )
                    )

                    if len(
                        ocr_text.strip()
                    ) > len(
                        native_text
                    ):

                        page_text = (
                            ocr_text.strip()
                        )

                        used_ocr = True

                        methods_used.add(
                            "paddle_ocr"
                        )

                finally:

                    if (
                        temporary_image_path
                        is not None
                        and
                        temporary_image_path.exists()
                    ):

                        temporary_image_path.unlink(
                            missing_ok=True
                        )

            if not used_ocr:

                methods_used.add(
                    "pymupdf"
                )

            extracted_pages.append(
                ExtractedPage(
                    page_number=(
                        page_index + 1
                    ),
                    text=page_text,
                    character_count=len(
                        page_text
                    ),
                    used_ocr=used_ocr,
                )
            )

    finally:

        document.close()

    full_text = "\n\n".join(
        page.text
        for page in extracted_pages
        if page.text
    ).strip()

    if methods_used == {
        "pymupdf"
    }:

        extraction_method = (
            "pymupdf"
        )

    elif methods_used == {
        "paddle_ocr"
    }:

        extraction_method = (
            "paddle_ocr"
        )

    else:

        extraction_method = (
            "pymupdf+paddle_ocr"
        )

    return DocumentExtractionResult(
        filename=filename,
        document_type="pdf",
        mime_type=mime_type,
        extraction_method=(
            extraction_method
        ),
        page_count=len(
            extracted_pages
        ),
        character_count=len(
            full_text
        ),
        text=full_text,
        pages=extracted_pages,
        metadata={
            "ocr_language": (
                ocr_language
            ),
            "ocr_dpi": (
                PDF_OCR_DPI
            ),
            "ocr_pages": [
                page.page_number
                for page
                in extracted_pages
                if page.used_ocr
            ],
        },
    )