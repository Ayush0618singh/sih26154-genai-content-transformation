from app.schemas.video import (
    VideoScene,
    VideoTranscriptSegment,
    VideoUnderstandingResult,
)

from app.services.video.ffmpeg_service import (
    parse_ffprobe_payload,
)

from app.services.video.gemini_video_service import (
    select_video_processing_mode,
)

from app.services.video.video_parser import (
    build_canonical_video_text,
    format_timestamp,
)


def test_timestamp_formatting():

    assert (
        format_timestamp(
            0
        )
        == "00:00:00"
    )

    assert (
        format_timestamp(
            65
        )
        == "00:01:05"
    )

    assert (
        format_timestamp(
            3661
        )
        == "01:01:01"
    )


def test_short_video_uses_static_processing():

    assert (
        select_video_processing_mode(
            120
        )
        == "static"
    )


def test_long_video_uses_agentic_processing():

    assert (
        select_video_processing_mode(
            600
        )
        == "agentic"
    )


def test_ffprobe_payload_parsing():

    payload = {
        "streams": [
            {
                "codec_type":
                    "video",

                "codec_name":
                    "h264",

                "width":
                    1920,

                "height":
                    1080,

                "avg_frame_rate":
                    "30/1",
            },

            {
                "codec_type":
                    "audio",

                "codec_name":
                    "aac",
            },
        ],

        "format": {
            "duration":
                "120.5",

            "format_name":
                "mov,mp4,m4a,3gp,3g2,mj2",

            "bit_rate":
                "2500000",
        },
    }


    result = (
        parse_ffprobe_payload(
            payload
        )
    )


    assert (
        result.duration_seconds
        == 120.5
    )

    assert (
        result.width
        == 1920
    )

    assert (
        result.height
        == 1080
    )

    assert (
        result.fps
        == 30.0
    )

    assert (
        result.video_codec
        == "h264"
    )

    assert (
        result.audio_codec
        == "aac"
    )

    assert (
        result.has_audio
        is True
    )


def test_canonical_video_text():

    understanding = (
        VideoUnderstandingResult(
            title=(
                "Security Briefing"
            ),

            summary=(
                "A security briefing "
                "describing an incident."
            ),

            detected_language=(
                "English"
            ),

            key_points=[
                "Incident detected.",
                "Response initiated.",
            ],

            entities=[
                "Security Team",
            ],

            topics=[
                "Cybersecurity",
            ],

            transcript_segments=[
                VideoTranscriptSegment(
                    start_seconds=(
                        1
                    ),

                    end_seconds=(
                        5
                    ),

                    speaker=(
                        "Presenter"
                    ),

                    text=(
                        "The incident was "
                        "detected this morning."
                    ),
                )
            ],

            scenes=[
                VideoScene(
                    start_seconds=(
                        0
                    ),

                    end_seconds=(
                        10
                    ),

                    description=(
                        "Presenter explains "
                        "the incident."
                    ),

                    important_visuals=[
                        "Incident timeline",
                    ],

                    on_screen_text=[
                        "Incident Response",
                    ],
                )
            ],

            visual_observations=[
                "Timeline graphic shown.",
            ],

            audio_observations=[
                "Clear spoken narration.",
            ],

            on_screen_text=[
                "Incident Response",
            ],
        )
    )


    text = (
        build_canonical_video_text(
            result=(
                understanding
            ),

            duration_seconds=(
                120
            ),

            width=(
                1920
            ),

            height=(
                1080
            ),

            fps=(
                30
            ),

            has_audio=(
                True
            ),
        )
    )


    assert (
        "[[VIDEO SOURCE]]"
        in text
    )

    assert (
        "[[TRANSCRIPT]]"
        in text
    )

    assert (
        "[[SCENE TIMELINE]]"
        in text
    )

    assert (
        "00:00:01"
        in text
    )

    assert (
        "Incident Response"
        in text
    )