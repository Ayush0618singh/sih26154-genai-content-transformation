from app.schemas.management import (
    TextDocumentCreateRequest,
)


def test_direct_text_input() -> None:

    request = (
        TextDocumentCreateRequest(
            title=(
                "Digital India "
                "Policy Article"
            ),
            content=(
                "Generative AI can "
                "transform public "
                "communication."
            ),
            language="English",
        )
    )

    assert (
        request.title
        == (
            "Digital India "
            "Policy Article"
        )
    )

    assert len(
        request.content
    ) > 0