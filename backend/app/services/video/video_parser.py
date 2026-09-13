from __future__ import annotations

from pathlib import (
    Path,
)

from app.core.config import (
    settings,
)

from app.schemas.video import (
    VideoExtractionResult,
    VideoUnderstandingResult,
)

from app.services.video.ffmpeg_service import (
    ffmpeg_video_service,
)

from app.services.video.gemini_video_service import (
    gemini_video_service,
    select_video_processing_mode,
)


def format_timestamp(
    seconds: float,
) -> str:

    total_seconds = max(
        0,
        int(
            round(
                seconds
            )
        ),
    )

    hours = (
        total_seconds
        // 3600
    )

    minutes = (
        (
            total_seconds
            % 3600
        )
        // 60
    )

    secs = (
        total_seconds
        % 60
    )

    return (
        f"{hours:02d}:"
        f"{minutes:02d}:"
        f"{secs:02d}"
    )


def _append_list(
    lines: list[str],
    title: str,
    values: list[str],
) -> None:

    if not values:
        return

    lines.extend(
        [
            "",
            title,
        ]
    )

    for value in values:

        value = (
            value.strip()
        )

        if value:

            lines.append(
                f"- {value}"
            )


def build_canonical_video_text(
    *,
    result:
        VideoUnderstandingResult,

    duration_seconds:
        float,

    width:
        int,

    height:
        int,

    fps:
        float | None,

    has_audio:
        bool,
) -> str:

    lines: list[str] = [
        "[[VIDEO SOURCE]]",

        (
            "Duration: "
            f"{format_timestamp(duration_seconds)}"
        ),

        (
            "Resolution: "
            f"{width}x{height}"
        ),

        (
            "Frame rate: "
            f"{fps if fps is not None else 'unknown'}"
        ),

        (
            "Audio stream: "
            f"{'present' if has_audio else 'not detected'}"
        ),

        (
            "Detected language: "
            f"{result.detected_language}"
        ),

        "",
        "[[VIDEO SUMMARY]]",

        result.summary.strip(),
    ]

    if result.title:

        lines.insert(
            1,
            (
                "Title: "
                f"{result.title.strip()}"
            ),
        )

    _append_list(
        lines,
        "[[KEY POINTS]]",
        result.key_points,
    )

    _append_list(
        lines,
        "[[TOPICS]]",
        result.topics,
    )

    _append_list(
        lines,
        "[[ENTITIES]]",
        result.entities,
    )


    if result.transcript_segments:

        lines.extend(
            [
                "",
                "[[TRANSCRIPT]]",
            ]
        )

        for segment in (
            result.transcript_segments
        ):

            start = format_timestamp(
                segment.start_seconds
            )

            end = format_timestamp(
                segment.end_seconds
            )

            speaker = (
                (
                    f"{segment.speaker.strip()}: "
                )
                if (
                    segment.speaker
                    and segment.speaker.strip()
                )
                else ""
            )

            lines.append(
                (
                    f"[{start} - {end}] "
                    f"{speaker}"
                    f"{segment.text.strip()}"
                )
            )


    if result.scenes:

        lines.extend(
            [
                "",
                "[[SCENE TIMELINE]]",
            ]
        )

        for (
            index,
            scene,
        ) in enumerate(
            result.scenes,
            start=1,
        ):

            start = format_timestamp(
                scene.start_seconds
            )

            end = format_timestamp(
                scene.end_seconds
            )

            lines.append(
                (
                    f"[[SCENE {index:03d} | "
                    f"{start} - {end}]]"
                )
            )

            lines.append(
                scene.description.strip()
            )

            for visual in (
                scene.important_visuals
            ):

                lines.append(
                    (
                        "Visual: "
                        f"{visual.strip()}"
                    )
                )

            for text in (
                scene.on_screen_text
            ):

                lines.append(
                    (
                        "On-screen text: "
                        f"{text.strip()}"
                    )
                )


    _append_list(
        lines,
        "[[VISUAL OBSERVATIONS]]",
        result.visual_observations,
    )

    _append_list(
        lines,
        "[[AUDIO OBSERVATIONS]]",
        result.audio_observations,
    )

    _append_list(
        lines,
        "[[ON-SCREEN TEXT]]",
        result.on_screen_text,
    )


    return (
        "\n".join(
            lines
        )
        .strip()
    )


class VideoParser:

    async def parse(
        self,
        *,
        file_path: Path,
        mime_type: str,
    ) -> VideoExtractionResult:

        probe = (
            ffmpeg_video_service
            .probe(
                file_path
            )
        )

        ffmpeg_video_service.validate_decode(
            file_path
        )

        understanding = (
            await gemini_video_service
            .analyze_video(
                file_path=(
                    file_path
                ),

                mime_type=(
                    mime_type
                ),

                duration_seconds=(
                    probe.duration_seconds
                ),
            )
        )

        text = (
            build_canonical_video_text(
                result=(
                    understanding
                ),

                duration_seconds=(
                    probe.duration_seconds
                ),

                width=(
                    probe.width
                ),

                height=(
                    probe.height
                ),

                fps=(
                    probe.fps
                ),

                has_audio=(
                    probe.has_audio
                ),
            )
        )

        processing_mode = (
            select_video_processing_mode(
                probe.duration_seconds
            )
        )

        return VideoExtractionResult(
            text=(
                text
            ),

            extraction_method=(
                "ffmpeg_probe+gemini_video"
            ),

            page_count=(
                0
            ),

            character_count=(
                len(
                    text
                )
            ),

            metadata={
                "media_type":
                    "video",

                "duration_seconds":
                    probe.duration_seconds,

                "duration_timestamp":
                    format_timestamp(
                        probe.duration_seconds
                    ),

                "width":
                    probe.width,

                "height":
                    probe.height,

                "fps":
                    probe.fps,

                "video_codec":
                    probe.video_codec,

                "audio_codec":
                    probe.audio_codec,

                "has_audio":
                    probe.has_audio,

                "container_format":
                    probe.format_name,

                "bitrate":
                    probe.bitrate,

                "detected_language":
                    understanding.detected_language,

                "transcript_segment_count":
                    len(
                        understanding.transcript_segments
                    ),

                "scene_count":
                    len(
                        understanding.scenes
                    ),

                "gemini_processing_mode":
                    processing_mode,

                "gemini_model":
                    settings.gemini_model,
            },
        )


video_parser = (
    VideoParser()
)