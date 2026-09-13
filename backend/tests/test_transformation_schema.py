from uuid import uuid4

import pytest

from app.schemas.transformation import (
    OutputType,
    TransformationRequest,
)


def test_transformation_request() -> None:
    request = TransformationRequest(
        document_id=uuid4(),
        target_audience=(
            "Government decision makers"
        ),
        tone="Professional",
        language="English",
        detail_level="balanced",
        objective=(
            "Explain the source clearly"
        ),
        selected_outputs=[
            OutputType.EXECUTIVE_SUMMARY,
            OutputType.PRESENTATION,
            OutputType.EXECUTIVE_SUMMARY,
        ],
        use_rag=True,
    )

    assert len(
        request.selected_outputs
    ) == 2

    assert (
        OutputType.PRESENTATION
        in request.selected_outputs
    )


@pytest.mark.parametrize(
    "output_type",
    list(OutputType),
)
def test_all_output_types(
    output_type: OutputType,
) -> None:
    assert output_type.value