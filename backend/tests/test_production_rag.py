from app.services.rag.rag_service import (
    prepare_embedding_document,
    prepare_embedding_query,
    split_rag_text,
)


def test_embedding_document_format():

    value = (
        prepare_embedding_document(
            "Important source content.",
            "Security Report",
        )
    )


    assert (
        value
        ==
        (
            "title: Security Report "
            "| text: Important source content."
        )
    )


def test_embedding_document_without_title():

    value = (
        prepare_embedding_document(
            "Source text."
        )
    )


    assert (
        value.startswith(
            "title: none"
        )
    )


def test_embedding_query_format():

    value = (
        prepare_embedding_query(
            "What happened?"
        )
    )


    assert (
        value
        ==
        (
            "task: search result "
            "| query: What happened?"
        )
    )


def test_rag_splitter_returns_content():

    text = (
        "Cybersecurity incident details. "
        * 500
    )


    chunks = (
        split_rag_text(
            text
        )
    )


    assert (
        len(
            chunks
        )
        > 1
    )


    assert all(
        chunk.strip()

        for chunk
        in chunks
    )