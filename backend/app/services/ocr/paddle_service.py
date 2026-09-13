import asyncio
import json
from pathlib import Path
from threading import Lock
from typing import Any

from paddleocr import PaddleOCR


class PaddleOCRService:

    def __init__(self) -> None:

        self._engines: dict[
            str,
            PaddleOCR,
        ] = {}

        self._engine_lock = Lock()

    def _get_engine(
        self,
        language: str,
    ) -> PaddleOCR:

        language = (
            language.strip().lower()
            or "en"
        )

        with self._engine_lock:

            engine = self._engines.get(
                language
            )

            if engine is None:

                engine = PaddleOCR(
                    lang=language,
                    use_doc_orientation_classify=False,
                    use_doc_unwarping=False,
                    use_textline_orientation=False,
                    device="cpu",
                )

                self._engines[
                    language
                ] = engine

        return engine

    @staticmethod
    def _normalise_result_payload(
        result: Any,
    ) -> dict[str, Any]:

        payload = getattr(
            result,
            "json",
            None,
        )

        if callable(payload):
            payload = payload()

        if payload is None:

            if isinstance(
                result,
                dict,
            ):
                payload = result
            else:
                return {}

        if isinstance(
            payload,
            str,
        ):

            try:
                payload = json.loads(
                    payload
                )

            except json.JSONDecodeError:
                return {}

        if not isinstance(
            payload,
            dict,
        ):
            return {}

        if isinstance(
            payload.get("res"),
            dict,
        ):
            return payload["res"]

        return payload

    def _extract_sync(
        self,
        image_path: Path,
        language: str,
    ) -> tuple[str, float | None]:

        engine = self._get_engine(
            language
        )

        results = engine.predict(
            str(image_path)
        )

        all_text: list[str] = []
        all_scores: list[float] = []

        for result in results:

            payload = (
                self._normalise_result_payload(
                    result
                )
            )

            texts = payload.get(
                "rec_texts",
                [],
            )

            scores = payload.get(
                "rec_scores",
                [],
            )

            for text in texts:

                cleaned = str(
                    text
                ).strip()

                if cleaned:
                    all_text.append(
                        cleaned
                    )

            for score in scores:

                try:
                    all_scores.append(
                        float(score)
                    )

                except (
                    TypeError,
                    ValueError,
                ):
                    continue

        text = "\n".join(
            all_text
        ).strip()

        average_confidence: (
            float | None
        ) = None

        if all_scores:

            average_confidence = (
                sum(all_scores)
                / len(all_scores)
            )

        return (
            text,
            average_confidence,
        )

    async def extract_text(
        self,
        image_path: Path,
        language: str = "en",
    ) -> tuple[str, float | None]:

        return await asyncio.to_thread(
            self._extract_sync,
            image_path,
            language,
        )


paddle_ocr_service = (
    PaddleOCRService()
)