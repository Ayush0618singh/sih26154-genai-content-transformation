from pathlib import Path

from app.schemas.export import (
    ExportFormat,
)
from app.services.generators.csv_generator import (
    csv_generator,
)
from app.services.generators.docx_generator import (
    docx_generator,
)
from app.services.generators.json_generator import (
    json_generator,
)
from app.services.generators.pdf_generator import (
    pdf_generator,
)
from app.services.generators.pptx_generator import (
    pptx_generator,
)
from app.services.generators.srt_generator import (
    srt_generator,
)


MIME_TYPES: dict[
    ExportFormat,
    str,
] = {
    ExportFormat.PDF: (
        "application/pdf"
    ),

    ExportFormat.DOCX: (
        "application/vnd.openxmlformats-"
        "officedocument.wordprocessingml.document"
    ),

    ExportFormat.PPTX: (
        "application/vnd.openxmlformats-"
        "officedocument.presentationml.presentation"
    ),

    ExportFormat.JSON: (
        "application/json"
    ),

    ExportFormat.CSV: (
        "text/csv"
    ),

    ExportFormat.SRT: (
        "application/x-subrip"
    ),
}


FILE_EXTENSIONS: dict[
    ExportFormat,
    str,
] = {
    ExportFormat.PDF: ".pdf",
    ExportFormat.DOCX: ".docx",
    ExportFormat.PPTX: ".pptx",
    ExportFormat.JSON: ".json",
    ExportFormat.CSV: ".csv",
    ExportFormat.SRT: ".srt",
}


GENERATORS = {
    ExportFormat.PDF: (
        pdf_generator
    ),

    ExportFormat.DOCX: (
        docx_generator
    ),

    ExportFormat.PPTX: (
        pptx_generator
    ),

    ExportFormat.JSON: (
        json_generator
    ),

    ExportFormat.CSV: (
        csv_generator
    ),

    ExportFormat.SRT: (
        srt_generator
    ),
}


def generate_export_file(
    export_format: ExportFormat,
    transformation: dict,
    outputs: list[dict],
    destination: Path,
) -> Path:
    generator = GENERATORS.get(
        export_format
    )

    if generator is None:
        raise ValueError(
            (
                "Unsupported export format: "
                f"{export_format}"
            )
        )

    return generator.generate(
        transformation=(
            transformation
        ),
        outputs=outputs,
        destination=destination,
    )