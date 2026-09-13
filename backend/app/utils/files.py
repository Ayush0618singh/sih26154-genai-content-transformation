import re
from pathlib import Path


ALLOWED_EXTENSIONS: dict[str, str] = {
    ".pdf": "pdf",
    ".docx": "docx",

    ".txt": "text",
    ".md": "text",

    ".json": "json",

    ".csv": "csv",
    ".xlsx": "xlsx",

    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".webp": "image",
    ".bmp": "image",
    ".tif": "image",
    ".tiff": "image",
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


def sanitize_filename(
    filename: str,
) -> str:

    original = Path(filename).name

    stem = Path(original).stem
    suffix = Path(original).suffix.lower()

    clean_stem = re.sub(
        r"[^A-Za-z0-9._-]+",
        "-",
        stem,
    )

    clean_stem = clean_stem.strip(
        "._-"
    )

    if not clean_stem:
        clean_stem = "document"

    return (
        f"{clean_stem[:120]}"
        f"{suffix}"
    )


def get_extension(
    filename: str,
) -> str:

    return Path(
        filename
    ).suffix.lower()


def get_input_type(
    filename: str,
) -> str:

    extension = get_extension(
        filename
    )

    input_type = ALLOWED_EXTENSIONS.get(
        extension
    )

    if input_type is None:
        raise ValueError(
            f"Unsupported file extension: "
            f"{extension or 'none'}"
        )

    return input_type


def is_image_file(
    filename: str,
) -> bool:

    return (
        get_extension(filename)
        in IMAGE_EXTENSIONS
    )