from app.services.analysis.hierarchical_analysis import (
    build_analysis_chunks,
    compute_confidence,
    find_evidence_span,
)


def test_short_text_is_single_chunk():
    text = (
        "This is a short document."
    )

    chunks = (
        build_analysis_chunks(
            text,
            chunk_size=100,
            overlap=10,
        )
    )

    assert len(
        chunks
    ) == 1

    assert (
        chunks[0].start_char
        == 0
    )

    assert (
        chunks[0].end_char
        == len(
            text
        )
    )


def test_long_document_has_no_gaps():
    text = (
        "abcdefghijklmnopqrstuvwxyz "
        * 300
    )

    chunks = (
        build_analysis_chunks(
            text,
            chunk_size=500,
            overlap=50,
        )
    )

    assert len(
        chunks
    ) > 1

    assert (
        chunks[0].start_char
        == 0
    )

    assert (
        chunks[-1].end_char
        == len(
            text
        )
    )

    # chunks has N elements while chunks[1:] has N-1.
    # This intentionally compares adjacent chunk pairs.

    for (
        previous,
        current,
    ) in zip(
        chunks,
        chunks[1:],
    ):

        assert (
            current.start_char
            <= previous.end_char
        )

        assert (
            current.start_char
            < current.end_char
        )


def test_all_text_positions_are_covered():
    text = (
        "0123456789"
        * 200
    )

    chunks = (
        build_analysis_chunks(
            text,
            chunk_size=120,
            overlap=20,
        )
    )

    covered = [
        False
        for _
        in text
    ]

    for chunk in (
        chunks
    ):

        for index in range(
            chunk.start_char,
            chunk.end_char,
        ):

            covered[
                index
            ] = True

    assert all(
        covered
    )


def test_chunks_are_ordered():
    text = (
        "A long document sentence. "
        * 500
    )

    chunks = (
        build_analysis_chunks(
            text,
            chunk_size=400,
            overlap=50,
        )
    )

    for (
        previous,
        current,
    ) in zip(
        chunks,
        chunks[1:],
    ):

        assert (
            current.index
            == previous.index
            + 1
        )

        assert (
            current.start_char
            > previous.start_char
        )

        assert (
            current.end_char
            > current.start_char
        )


def test_overlap_exists_between_chunks():
    text = (
        "abcdefghij"
        * 300
    )

    chunks = (
        build_analysis_chunks(
            text,
            chunk_size=200,
            overlap=25,
        )
    )

    assert len(
        chunks
    ) > 1

    for (
        previous,
        current,
    ) in zip(
        chunks,
        chunks[1:],
    ):

        assert (
            current.start_char
            < previous.end_char
        )


def test_exact_evidence_span():
    chunk = (
        "The report states that "
        "revenue increased by 15% "
        "during the year."
    )

    result = (
        find_evidence_span(
            chunk,
            "revenue increased by 15%",
        )
    )

    assert (
        result
        is not None
    )

    start, end = (
        result
    )

    assert (
        chunk[
            start:end
        ]
        ==
        "revenue increased by 15%"
    )


def test_evidence_whitespace_matching():
    chunk = (
        "Revenue increased\n"
        "by 15 percent."
    )

    result = (
        find_evidence_span(
            chunk,
            (
                "Revenue increased "
                "by 15 percent."
            ),
        )
    )

    assert (
        result
        is not None
    )


def test_missing_evidence_returns_none():
    chunk = (
        "The system processed "
        "100 requests."
    )

    result = (
        find_evidence_span(
            chunk,
            "Revenue increased by 20%.",
        )
    )

    assert (
        result
        is None
    )


def test_confidence_full_coverage():
    confidence = (
        compute_confidence(
            coverage_ratio=(
                1.0
            ),

            verified_evidence=(
                9
            ),

            total_evidence_candidates=(
                10
            ),

            metadata={
                "extraction_method":
                    "native_text"
            },
        )
    )

    assert (
        confidence.coverage
        == 1.0
    )

    assert (
        confidence.overall
        >= 0.9
    )

    assert (
        confidence.label
        == "high"
    )


def test_confidence_drops_with_low_coverage():
    confidence = (
        compute_confidence(
            coverage_ratio=(
                0.4
            ),

            verified_evidence=(
                1
            ),

            total_evidence_candidates=(
                10
            ),

            metadata={
                "extraction_method":
                    "ocr"
            },
        )
    )

    assert (
        confidence.overall
        < 0.72
    )

    assert (
        confidence.label
        == "limited"
    )


def test_confidence_is_bounded():
    confidence = (
        compute_confidence(
            coverage_ratio=(
                1.0
            ),

            verified_evidence=(
                100
            ),

            total_evidence_candidates=(
                100
            ),

            metadata={
                "extraction_method":
                    "native_text"
            },
        )
    )

    assert (
        0.0
        <= confidence.overall
        <= 1.0
    )

    assert (
        0.0
        <= confidence.coverage
        <= 1.0
    )

    assert (
        0.0
        <= confidence.evidence_verification
        <= 1.0
    )

    assert (
        0.0
        <= confidence.source_quality
        <= 1.0
    )