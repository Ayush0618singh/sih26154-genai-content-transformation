import csv
import json
from pathlib import Path
from typing import Any

from app.services.generators.content_utils import (
    clean_text,
    ensure_parent_directory,
    get_content_json,
)


class CSVGenerator:

    def _structured_data_rows(
        self,
        output: dict,
    ) -> list[dict]:
        content = (
            get_content_json(
                output
            )
        )

        fields = (
            content.get(
                "fields"
            )
            or []
        )

        rows: list[dict] = []

        for field in fields:
            if not isinstance(
                field,
                dict,
            ):
                continue

            rows.append(
                {
                    "output_type": (
                        "structured_data"
                    ),
                    "category": (
                        field.get(
                            "category",
                            "",
                        )
                    ),
                    "key": (
                        field.get(
                            "key",
                            "",
                        )
                    ),
                    "value": (
                        field.get(
                            "value",
                            "",
                        )
                    ),
                    "context": (
                        field.get(
                            "source_context",
                            "",
                        )
                    ),
                }
            )

        return rows

    def _action_item_rows(
        self,
        output: dict,
    ) -> list[dict]:
        content = (
            get_content_json(
                output
            )
        )

        items = (
            content.get(
                "items"
            )
            or []
        )

        rows: list[dict] = []

        for item in items:
            if not isinstance(
                item,
                dict,
            ):
                continue

            rows.append(
                {
                    "output_type": (
                        "action_items"
                    ),
                    "category": (
                        item.get(
                            "priority",
                            "",
                        )
                    ),
                    "key": (
                        item.get(
                            "owner_role",
                            "",
                        )
                    ),
                    "value": (
                        item.get(
                            "action",
                            "",
                        )
                    ),
                    "context": (
                        item.get(
                            "expected_outcome",
                            "",
                        )
                    ),
                }
            )

        return rows

    def _generic_rows(
        self,
        output: dict,
    ) -> list[dict]:
        output_type = str(
            output.get(
                "output_type",
                "output",
            )
        )

        content = (
            get_content_json(
                output
            )
        )

        rows: list[dict] = []

        for key, value in (
            content.items()
        ):
            if isinstance(
                value,
                (
                    dict,
                    list,
                ),
            ):
                serialised = json.dumps(
                    value,
                    ensure_ascii=False,
                )
            else:
                serialised = clean_text(
                    value
                )

            rows.append(
                {
                    "output_type": (
                        output_type
                    ),
                    "category": "",
                    "key": str(key),
                    "value": serialised,
                    "context": "",
                }
            )

        return rows

    def generate(
        self,
        transformation: dict,
        outputs: list[dict],
        destination: Path,
    ) -> Path:
        ensure_parent_directory(
            destination
        )

        rows: list[dict] = []

        for output in outputs:
            output_type = output.get(
                "output_type"
            )

            if (
                output_type
                == "structured_data"
            ):
                rows.extend(
                    self._structured_data_rows(
                        output
                    )
                )

            elif (
                output_type
                == "action_items"
            ):
                rows.extend(
                    self._action_item_rows(
                        output
                    )
                )

            else:
                rows.extend(
                    self._generic_rows(
                        output
                    )
                )

        with destination.open(
            "w",
            encoding="utf-8-sig",
            newline="",
        ) as file:
            writer = csv.DictWriter(
                file,
                fieldnames=[
                    "output_type",
                    "category",
                    "key",
                    "value",
                    "context",
                ],
            )

            writer.writeheader()

            writer.writerows(
                rows
            )

        return destination


csv_generator = CSVGenerator()