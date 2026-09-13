from pathlib import Path

from app.schemas.document import (
    DocumentExtractionResult,
)
from app.services.ingestion.docx_parser import (
    parse_docx_document,
)
from app.services.ingestion.image_parser import (
    parse_image_document,
)
from app.services.ingestion.pdf_parser import (
    parse_pdf_document,
)
from app.services.ingestion.tabular_parser import (
    parse_csv_document,
    parse_xlsx_document,
)
from app.services.ingestion.text_parser import (
    parse_text_document,
)
from app.utils.files import (
    get_input_type,
)


class DocumentParser:

    async def parse(
        self,
        file_path: Path,
        original_filename: str,
        mime_type: str,
        ocr_language: str = "en",
    ) -> DocumentExtractionResult:

        input_type = get_input_type(
            original_filename
        )

        if input_type == "pdf":

            return await parse_pdf_document(
                file_path=file_path,
                filename=original_filename,
                mime_type=mime_type,
                ocr_language=ocr_language,
            )

        if input_type == "docx":

            return await parse_docx_document(
                file_path=file_path,
                filename=original_filename,
                mime_type=mime_type,
            )

        if input_type in {
            "text",
            "json",
        }:

            return await parse_text_document(
                file_path=file_path,
                filename=original_filename,
                mime_type=mime_type,
                document_type=input_type,
            )

        if input_type == "csv":

            return await parse_csv_document(
                file_path=file_path,
                filename=original_filename,
                mime_type=mime_type,
            )

        if input_type == "xlsx":

            return await parse_xlsx_document(
                file_path=file_path,
                filename=original_filename,
                mime_type=mime_type,
            )

        if input_type == "image":

            return await parse_image_document(
                file_path=file_path,
                filename=original_filename,
                mime_type=mime_type,
                ocr_language=ocr_language,
            )

        raise ValueError(
            "No parser is configured for "
            f"input type: {input_type}"
        )


document_parser = DocumentParser()