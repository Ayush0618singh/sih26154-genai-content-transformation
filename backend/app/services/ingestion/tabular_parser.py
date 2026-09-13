from pathlib import Path

import pandas as pd

from app.schemas.document import (
    DocumentExtractionResult,
    ExtractedPage,
)


def _dataframe_to_text(
    dataframe: pd.DataFrame,
) -> str:

    dataframe = dataframe.fillna(
        ""
    )

    return dataframe.to_csv(
        index=False
    ).strip()


async def parse_csv_document(
    file_path: Path,
    filename: str,
    mime_type: str,
) -> DocumentExtractionResult:

    dataframe = pd.read_csv(
        file_path
    )

    text = _dataframe_to_text(
        dataframe
    )

    page = ExtractedPage(
        page_number=1,
        text=text,
        character_count=len(text),
        used_ocr=False,
    )

    return DocumentExtractionResult(
        filename=filename,
        document_type="csv",
        mime_type=mime_type,
        extraction_method="pandas",
        page_count=1,
        character_count=len(text),
        text=text,
        pages=[
            page,
        ],
        metadata={
            "rows": int(
                dataframe.shape[0]
            ),
            "columns": int(
                dataframe.shape[1]
            ),
            "column_names": [
                str(column)
                for column
                in dataframe.columns
            ],
        },
    )


async def parse_xlsx_document(
    file_path: Path,
    filename: str,
    mime_type: str,
) -> DocumentExtractionResult:

    workbook = pd.read_excel(
        file_path,
        sheet_name=None,
    )

    sheet_sections: list[str] = []

    sheet_metadata: dict[
        str,
        dict[str, int],
    ] = {}

    for (
        sheet_name,
        dataframe,
    ) in workbook.items():

        dataframe = (
            dataframe.fillna("")
        )

        sheet_metadata[
            str(sheet_name)
        ] = {
            "rows": int(
                dataframe.shape[0]
            ),
            "columns": int(
                dataframe.shape[1]
            ),
        }

        section = (
            f"[Sheet: {sheet_name}]\n"
            + _dataframe_to_text(
                dataframe
            )
        )

        sheet_sections.append(
            section
        )

    text = "\n\n".join(
        sheet_sections
    ).strip()

    page = ExtractedPage(
        page_number=1,
        text=text,
        character_count=len(text),
        used_ocr=False,
    )

    return DocumentExtractionResult(
        filename=filename,
        document_type="xlsx",
        mime_type=mime_type,
        extraction_method="pandas",
        page_count=1,
        character_count=len(text),
        text=text,
        pages=[
            page,
        ],
        metadata={
            "sheet_count": len(
                workbook
            ),
            "sheets": sheet_metadata,
        },
    )