from app.services.rag.chunker import (
    document_chunker,
)


def test_document_chunker() -> None:
    text = (
        "Artificial intelligence is "
        "transforming communication. "
        * 500
    )

    chunks = (
        document_chunker.split(
            text
        )
    )

    assert len(chunks) > 1

    assert all(
        chunk.text.strip()
        for chunk in chunks
    )

    assert chunks[0].index == 0