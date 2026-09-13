import json
import re
from pathlib import Path
from typing import Any


def humanize_key(
    key: str,
) -> str:
    text = key.replace(
        "_",
        " ",
    ).replace(
        "-",
        " ",
    )

    return text.strip().title()


def clean_text(
    value: Any,
) -> str:
    if value is None:
        return ""

    if isinstance(
        value,
        bool,
    ):
        return (
            "Yes"
            if value
            else "No"
        )

    if isinstance(
        value,
        (
            str,
            int,
            float,
        ),
    ):
        return str(value).strip()

    return json.dumps(
        value,
        ensure_ascii=False,
        indent=2,
    )


def safe_file_stem(
    value: str,
    max_length: int = 80,
) -> str:
    value = re.sub(
        r"[^A-Za-z0-9._-]+",
        "-",
        value,
    )

    value = value.strip(
        ".-_"
    )

    if not value:
        value = "transformation"

    return value[:max_length]


def output_title(
    output: dict,
) -> str:
    title = (
        output.get("title")
        or ""
    ).strip()

    if title:
        return title

    output_type = str(
        output.get(
            "output_type",
            "output",
        )
    )

    return humanize_key(
        output_type
    )


def get_content_json(
    output: dict,
) -> dict:
    content = output.get(
        "content_json"
    )

    if isinstance(
        content,
        dict,
    ):
        return content

    return {}


def value_to_lines(
    value: Any,
    prefix: str = "",
) -> list[str]:
    lines: list[str] = []

    if value is None:
        return lines

    if isinstance(
        value,
        dict,
    ):
        for key, nested_value in (
            value.items()
        ):
            heading = humanize_key(
                str(key)
            )

            if isinstance(
                nested_value,
                (
                    dict,
                    list,
                ),
            ):
                lines.append(
                    f"{prefix}{heading}:"
                )

                lines.extend(
                    value_to_lines(
                        nested_value,
                        prefix=(
                            prefix + "  "
                        ),
                    )
                )

            else:
                text = clean_text(
                    nested_value
                )

                if text:
                    lines.append(
                        (
                            f"{prefix}"
                            f"{heading}: "
                            f"{text}"
                        )
                    )

        return lines

    if isinstance(
        value,
        list,
    ):
        for item in value:
            if isinstance(
                item,
                (
                    dict,
                    list,
                ),
            ):
                nested = (
                    value_to_lines(
                        item,
                        prefix=(
                            prefix + "  "
                        ),
                    )
                )

                if nested:
                    lines.append(
                        f"{prefix}•"
                    )

                    lines.extend(
                        nested
                    )

            else:
                text = clean_text(
                    item
                )

                if text:
                    lines.append(
                        (
                            f"{prefix}"
                            f"• {text}"
                        )
                    )

        return lines

    text = clean_text(
        value
    )

    if text:
        lines.append(
            f"{prefix}{text}"
        )

    return lines


def shorten_text(
    value: str,
    max_length: int,
) -> str:
    clean = " ".join(
        value.split()
    )

    if len(clean) <= max_length:
        return clean

    return (
        clean[
            :max_length - 3
        ].rstrip()
        + "..."
    )


def ensure_parent_directory(
    destination: Path,
) -> None:
    destination.parent.mkdir(
        parents=True,
        exist_ok=True,
    )