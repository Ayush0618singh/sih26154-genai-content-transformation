from app.schemas.reliability import (
    ChunkAnalysis,
    ConfidenceMetadata,
    CoverageMetadata,
    EvidenceCandidate,
    ReliableDocumentAnalysis,
)


def test_chunk_analysis_defaults_are_independent():
    first = (
        ChunkAnalysis(
            summary="First"
        )
    )

    second = (
        ChunkAnalysis(
            summary="Second"
        )
    )


    first.topics.append(
        "security"
    )


    assert (
        second.topics
        == []
    )


def test_evidence_candidate():
    evidence = (
        EvidenceCandidate(
            claim=(
                "System availability improved."
            ),

            supporting_text=(
                "Availability improved by 15%."
            ),

            category=(
                "metric"
            ),

            importance=(
                5
            ),
        )
    )


    assert (
        evidence.importance
        == 5
    )


def test_reliable_analysis_schema():
    analysis = (
        ReliableDocumentAnalysis(
            one_line_summary=(
                "Summary"
            ),

            executive_context=(
                "Context"
            ),

            coverage=(
                CoverageMetadata(
                    total_source_characters=(
                        1000
                    ),

                    total_chunks=(
                        2
                    ),

                    analyzed_chunks=(
                        2
                    ),

                    failed_chunks=(
                        0
                    ),

                    coverage_ratio=(
                        1.0
                    ),
                )
            ),

            confidence=(
                ConfidenceMetadata(
                    overall=(
                        0.9
                    ),

                    coverage=(
                        1.0
                    ),

                    evidence_verification=(
                        0.8
                    ),

                    source_quality=(
                        0.9
                    ),

                    label=(
                        "high"
                    ),
                )
            ),

            model=(
                "gemini-3.8-flash"
            ),
        )
    )


    assert (
        analysis.coverage
        .sampling_used
        is False
    )


    assert (
        analysis.confidence
        .label
        == "high"
    )