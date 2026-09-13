from __future__ import annotations

import os


def _read_positive_int(
    name: str,
    default: int,
) -> int:

    raw = os.getenv(
        name
    )

    if not raw:
        return default

    try:

        value = int(
            raw
        )

    except ValueError:

        return default


    if value <= 0:
        return default


    return value


VIDEO_MAX_DURATION_SECONDS = (
    _read_positive_int(
        "VIDEO_MAX_DURATION_SECONDS",
        3600,
    )
)


VIDEO_GEMINI_PROCESSING_TIMEOUT_SECONDS = (
    _read_positive_int(
        "VIDEO_GEMINI_PROCESSING_TIMEOUT_SECONDS",
        900,
    )
)


VIDEO_AGENTIC_THRESHOLD_SECONDS = (
    _read_positive_int(
        "VIDEO_AGENTIC_THRESHOLD_SECONDS",
        300,
    )
)


VIDEO_FFPROBE_TIMEOUT_SECONDS = (
    _read_positive_int(
        "VIDEO_FFPROBE_TIMEOUT_SECONDS",
        30,
    )
)


VIDEO_FFMPEG_DECODE_TIMEOUT_SECONDS = (
    _read_positive_int(
        "VIDEO_FFMPEG_DECODE_TIMEOUT_SECONDS",
        60,
    )
)