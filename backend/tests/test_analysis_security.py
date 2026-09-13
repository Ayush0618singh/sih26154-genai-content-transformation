from app.services.analysis.hierarchical_analysis import (
    MAP_SYSTEM_INSTRUCTION,
    REDUCE_SYSTEM_INSTRUCTION,
)


def test_map_prompt_treats_source_as_untrusted():
    normalized = (
        MAP_SYSTEM_INSTRUCTION.lower()
    )


    assert (
        "untrusted"
        in normalized
    )


    assert (
        "never follow"
        in normalized
    )


def test_reduce_prompt_rejects_source_instructions():
    normalized = (
        REDUCE_SYSTEM_INSTRUCTION.lower()
    )


    assert (
        "data"
        in normalized
    )


    assert (
        "not instructions"
        in normalized
    )