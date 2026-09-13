from __future__ import annotations

import json
import shutil
import subprocess

from dataclasses import (
    dataclass,
)

from fractions import (
    Fraction,
)

from pathlib import (
    Path,
)

from typing import (
    Any,
)

from app.core.video_config import (
    VIDEO_FFMPEG_DECODE_TIMEOUT_SECONDS,
    VIDEO_FFPROBE_TIMEOUT_SECONDS,
    VIDEO_MAX_DURATION_SECONDS,
)


class VideoProbeError(
    RuntimeError
):
    pass


class FFmpegNotInstalledError(
    VideoProbeError
):
    pass


@dataclass(
    frozen=True
)
class VideoProbeResult:
    duration_seconds: float

    width: int

    height: int

    fps: float | None

    video_codec: str | None

    audio_codec: str | None

    has_audio: bool

    format_name: str | None

    bitrate: int | None


def _parse_float(
    value: Any,
) -> float | None:

    try:

        if value in (
            None,
            "",
            "N/A",
        ):
            return None

        return float(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return None


def _parse_int(
    value: Any,
) -> int | None:

    try:

        if value in (
            None,
            "",
            "N/A",
        ):
            return None

        return int(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return None


def _parse_frame_rate(
    value: Any,
) -> float | None:

    if not value:
        return None


    try:

        fraction = Fraction(
            str(
                value
            )
        )


        if fraction.denominator == 0:
            return None


        fps = float(
            fraction
        )


        if fps <= 0:
            return None


        return round(
            fps,
            4,
        )

    except (
        ValueError,
        ZeroDivisionError,
    ):

        return None


def parse_ffprobe_payload(
    payload: dict[
        str,
        Any,
    ],
) -> VideoProbeResult:

    streams = payload.get(
        "streams"
    ) or []


    format_info = payload.get(
        "format"
    ) or {}


    video_stream = next(
        (
            stream
            for stream
            in streams
            if stream.get(
                "codec_type"
            )
            == "video"
        ),
        None,
    )


    if not video_stream:

        raise VideoProbeError(
            "Uploaded media does not contain "
            "a video stream."
        )


    audio_stream = next(
        (
            stream
            for stream
            in streams
            if stream.get(
                "codec_type"
            )
            == "audio"
        ),
        None,
    )


    duration = (
        _parse_float(
            format_info.get(
                "duration"
            )
        )
        or _parse_float(
            video_stream.get(
                "duration"
            )
        )
    )


    if (
        duration is None
        or duration <= 0
    ):

        raise VideoProbeError(
            "Could not determine video duration."
        )


    if (
        duration
        > VIDEO_MAX_DURATION_SECONDS
    ):

        raise VideoProbeError(
            "Video duration exceeds the configured "
            f"limit of "
            f"{VIDEO_MAX_DURATION_SECONDS} seconds."
        )


    width = (
        _parse_int(
            video_stream.get(
                "width"
            )
        )
        or 0
    )


    height = (
        _parse_int(
            video_stream.get(
                "height"
            )
        )
        or 0
    )


    if (
        width <= 0
        or height <= 0
    ):

        raise VideoProbeError(
            "Invalid video resolution."
        )


    bitrate = (
        _parse_int(
            format_info.get(
                "bit_rate"
            )
        )
    )


    return VideoProbeResult(
        duration_seconds=(
            round(
                duration,
                3,
            )
        ),

        width=(
            width
        ),

        height=(
            height
        ),

        fps=(
            _parse_frame_rate(
                video_stream.get(
                    "avg_frame_rate"
                )
                or video_stream.get(
                    "r_frame_rate"
                )
            )
        ),

        video_codec=(
            video_stream.get(
                "codec_name"
            )
        ),

        audio_codec=(
            audio_stream.get(
                "codec_name"
            )
            if audio_stream
            else None
        ),

        has_audio=(
            audio_stream
            is not None
        ),

        format_name=(
            format_info.get(
                "format_name"
            )
        ),

        bitrate=(
            bitrate
        ),
    )


class FFmpegVideoService:

    def ensure_available(
        self,
    ) -> None:

        if not shutil.which(
            "ffprobe"
        ):

            raise FFmpegNotInstalledError(
                "ffprobe was not found. "
                "Install FFmpeg and ensure it "
                "is available on PATH."
            )


        if not shutil.which(
            "ffmpeg"
        ):

            raise FFmpegNotInstalledError(
                "ffmpeg was not found. "
                "Install FFmpeg and ensure it "
                "is available on PATH."
            )


    def probe(
        self,
        file_path: Path,
    ) -> VideoProbeResult:

        self.ensure_available()


        command = [
            "ffprobe",

            "-v",
            "error",

            "-print_format",
            "json",

            "-show_format",

            "-show_streams",

            str(
                file_path
            ),
        ]


        try:

            result = subprocess.run(
                command,

                check=False,

                capture_output=True,

                text=True,

                timeout=(
                    VIDEO_FFPROBE_TIMEOUT_SECONDS
                ),

                shell=False,
            )

        except subprocess.TimeoutExpired as exc:

            raise VideoProbeError(
                "Video metadata inspection timed out."
            ) from exc


        if result.returncode != 0:

            error = (
                result.stderr.strip()
                or "ffprobe failed."
            )


            raise VideoProbeError(
                (
                    "Video container could not "
                    f"be inspected: {error[:500]}"
                )
            )


        try:

            payload = json.loads(
                result.stdout
            )

        except json.JSONDecodeError as exc:

            raise VideoProbeError(
                "ffprobe returned invalid metadata."
            ) from exc


        return (
            parse_ffprobe_payload(
                payload
            )
        )


    def validate_decode(
        self,
        file_path: Path,
    ) -> None:

        self.ensure_available()


        # Decode one video frame.
        #
        # This catches many corrupt or fake containers
        # before sending anything to Gemini.

        command = [
            "ffmpeg",

            "-v",
            "error",

            "-i",
            str(
                file_path
            ),

            "-map",
            "0:v:0",

            "-frames:v",
            "1",

            "-f",
            "null",

            "-",
        ]


        try:

            result = subprocess.run(
                command,

                check=False,

                capture_output=True,

                timeout=(
                    VIDEO_FFMPEG_DECODE_TIMEOUT_SECONDS
                ),

                shell=False,
            )

        except subprocess.TimeoutExpired as exc:

            raise VideoProbeError(
                "Video decode validation timed out."
            ) from exc


        if result.returncode != 0:

            error = (
                result.stderr.decode(
                    "utf-8",
                    errors="replace",
                )
                .strip()
            )


            raise VideoProbeError(
                (
                    "Video failed decode validation: "
                    f"{error[:500]}"
                )
            )


ffmpeg_video_service = (
    FFmpegVideoService()
)