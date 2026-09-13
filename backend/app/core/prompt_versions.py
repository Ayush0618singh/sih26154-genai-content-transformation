ANALYSIS_MAP_PROMPT_VERSION = (
    "analysis-map-v2.0.0"
)

ANALYSIS_REDUCE_PROMPT_VERSION = (
    "analysis-reduce-v2.0.0"
)

TRANSFORMATION_PROMPT_VERSION = (
    "transformation-v2.0.0"
)

RAG_PROMPT_VERSION = (
    "rag-v2.0.0"
)


def get_analysis_prompt_versions() -> dict[str, str]:
    return {
        "map":
            ANALYSIS_MAP_PROMPT_VERSION,

        "reduce":
            ANALYSIS_REDUCE_PROMPT_VERSION,
    }