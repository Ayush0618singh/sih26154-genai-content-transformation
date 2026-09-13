from datetime import timedelta
from pathlib import Path

import srt

from app.services.generators.content_utils import (
    ensure_parent_directory,
    get_content_json,
)


class SRTGenerator:

    def _find_video_output(
        self,
        outputs: list[dict],
    ) -> dict | None:
        for output in outputs:
            if (
                output.get(
                    "output_type"
                )
                == "video_script"
            ):
                return output

        return None

    def generate(
        self,
        transformation: dict,
        outputs: list[dict],
        destination: Path,
    ) -> Path:
        ensure_parent_directory(
            destination
        )

        video_output = (
            self._find_video_output(
                outputs
            )
        )

        if video_output is None:
            raise ValueError(
                "SRT export requires a "
                "video_script output."
            )

        content = (
            get_content_json(
                video_output
            )
        )

        scenes = (
            content.get(
                "scenes"
            )
            or []
        )

        if not scenes:
            raise ValueError(
                "Video script contains no scenes."
            )

        subtitles: list[
            srt.Subtitle
        ] = []

        current_seconds = 0

        subtitle_index = 1

        for scene in scenes:
            if not isinstance(
                scene,
                dict,
            ):
                continue

            try:
                duration = int(
                    scene.get(
                        "duration_seconds",
                        5,
                    )
                )
            except (
                TypeError,
                ValueError,
            ):
                duration = 5

            duration = max(
                duration,
                1,
            )

            voiceover = str(
                scene.get(
                    "voiceover",
                    "",
                )
            ).strip()

            on_screen_text = str(
                scene.get(
                    "on_screen_text",
                    "",
                )
            ).strip()

            subtitle_text = (
                voiceover
                or on_screen_text
            )

            if not subtitle_text:
                current_seconds += (
                    duration
                )

                continue

            start = timedelta(
                seconds=current_seconds
            )

            end = timedelta(
                seconds=(
                    current_seconds
                    + duration
                )
            )

            subtitles.append(
                srt.Subtitle(
                    index=(
                        subtitle_index
                    ),
                    start=start,
                    end=end,
                    content=(
                        subtitle_text
                    ),
                )
            )

            subtitle_index += 1

            current_seconds += duration

        if not subtitles:
            raise ValueError(
                "Video script contains no "
                "captionable content."
            )

        destination.write_text(
            srt.compose(
                subtitles
            ),
            encoding="utf-8",
        )

        return destination


srt_generator = SRTGenerator()