import json
from pathlib import Path

from app.services.generators.content_utils import (
    ensure_parent_directory,
)


class JSONGenerator:

    def generate(
        self,
        transformation: dict,
        outputs: list[dict],
        destination: Path,
    ) -> Path:
        ensure_parent_directory(
            destination
        )

        payload = {
            "transformation": {
                "id": transformation.get(
                    "id"
                ),
                "title": transformation.get(
                    "title"
                ),
                "status": transformation.get(
                    "status"
                ),
                "target_audience": (
                    transformation.get(
                        "target_audience"
                    )
                ),
                "tone": transformation.get(
                    "tone"
                ),
                "language": (
                    transformation.get(
                        "language"
                    )
                ),
                "detail_level": (
                    transformation.get(
                        "detail_level"
                    )
                ),
                "objective": (
                    transformation.get(
                        "objective"
                    )
                ),
                "analysis": (
                    transformation.get(
                        "analysis_json"
                    )
                    or {}
                ),
            },
            "outputs": [
                {
                    "id": output.get(
                        "id"
                    ),
                    "output_type": (
                        output.get(
                            "output_type"
                        )
                    ),
                    "title": output.get(
                        "title"
                    ),
                    "content": (
                        output.get(
                            "content_json"
                        )
                        or {}
                    ),
                }
                for output in outputs
            ],
        }

        destination.write_text(
            json.dumps(
                payload,
                ensure_ascii=False,
                indent=2,
                default=str,
            ),
            encoding="utf-8",
        )

        return destination


json_generator = JSONGenerator()