from app.middleware.rate_limit import (
    classify_rate_limit,
)


def test_upload_is_heavy():

    rule = (
        classify_rate_limit(
            method=(
                "POST"
            ),

            path=(
                "/api/v1/documents/upload"
            ),
        )
    )


    assert (
        rule.bucket
        == "heavy"
    )


def test_transformation_is_heavy():

    rule = (
        classify_rate_limit(
            method=(
                "POST"
            ),

            path=(
                "/api/v1/transformations"
            ),
        )
    )


    assert (
        rule.bucket
        == "heavy"
    )


def test_regular_get_uses_default_limit():

    rule = (
        classify_rate_limit(
            method=(
                "GET"
            ),

            path=(
                "/api/v1/documents"
            ),
        )
    )


    assert (
        rule.bucket
        == "default"
    )


def test_get_transformation_not_classed_as_heavy():

    rule = (
        classify_rate_limit(
            method=(
                "GET"
            ),

            path=(
                "/api/v1/transformations/abc"
            ),
        )
    )


    assert (
        rule.bucket
        == "default"
    )