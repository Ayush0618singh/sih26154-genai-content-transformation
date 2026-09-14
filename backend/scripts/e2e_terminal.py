from __future__ import annotations

import asyncio
import os

import httpx

from supabase import (
    create_client,
)

from app.core.config import (
    settings,
)


API_URL = (
    os.getenv(
        "E2E_API_URL",
        (
            "http://127.0.0.1:8000"
            "/api/v1"
        ),
    )
    .rstrip(
        "/"
    )
)


TEST_EMAIL = (
    os.getenv(
        "E2E_TEST_EMAIL",
        ""
    )
    .strip()
)


TEST_PASSWORD = (
    os.getenv(
        "E2E_TEST_PASSWORD",
        ""
    )
)


def require(
    name: str,
    value: str,
) -> None:

    if not value:

        raise RuntimeError(
            f"{name} is required."
        )


def print_ok(
    message: str,
) -> None:

    print(
        f"[OK] {message}"
    )


async def main() -> None:

    require(
        "E2E_TEST_EMAIL",
        TEST_EMAIL,
    )


    require(
        "E2E_TEST_PASSWORD",
        TEST_PASSWORD,
    )


    require(
        "SUPABASE_URL",
        settings.supabase_url,
    )


    require(
        "SUPABASE_ANON_KEY",
        settings.supabase_anon_key,
    )


    print(
        "\n========================================"
    )

    print(
        "SIH26154 TERMINAL END-TO-END TEST"
    )

    print(
        "========================================\n"
    )


    supabase = (
        create_client(
            settings.supabase_url,
            settings.supabase_anon_key,
        )
    )


    auth_response = (
        supabase.auth
        .sign_in_with_password(
            {
                "email":
                    TEST_EMAIL,

                "password":
                    TEST_PASSWORD,
            }
        )
    )


    if (
        not auth_response.session
    ):

        raise RuntimeError(
            "Supabase login failed."
        )


    access_token = (
        auth_response
        .session
        .access_token
    )


    print_ok(
        "Supabase authentication"
    )


    headers = {
        "Authorization":
            f"Bearer {access_token}"
    }


    document_id: (
        str | None
    ) = None


    transformation_id: (
        str | None
    ) = None


    async with httpx.AsyncClient(
        base_url=(
            API_URL
        ),

        headers=(
            headers
        ),

        timeout=(
            httpx.Timeout(
                900.0
            )
        ),
    ) as client:

        try:

            # =================================================
            # Health
            # =================================================

            response = (
                await client.get(
                    "/health"
                )
            )

            response.raise_for_status()


            print_ok(
                "Backend health"
            )


            # =================================================
            # Profile
            # =================================================

            response = (
                await client.get(
                    "/profile/me"
                )
            )

            response.raise_for_status()


            print_ok(
                "Authenticated profile"
            )


            # =================================================
            # Direct-text source
            # =================================================

            source_text = (
                "On September 10, 2026, the security "
                "operations team identified a suspicious "
                "authentication campaign. "
                "The team isolated three affected systems "
                "within 25 minutes. "
                "No evidence of customer data exfiltration "
                "was discovered during the initial review. "
                "The incident response team recommended "
                "mandatory credential rotation, MFA review, "
                "continuous monitoring, and a follow-up "
                "security assessment within seven days."
            )


            response = (
                await client.post(
                    "/documents/text",

                    json={
                        "title":
                            (
                                "E2E Security "
                                "Incident Report"
                            ),

                        "content":
                            source_text,

                        "language":
                            "English",
                    },
                )
            )

            response.raise_for_status()


            document_payload = (
                response.json()
            )


            document_id = str(
                document_payload[
                    "id"
                ]
            )


            print_ok(
                (
                    "Direct text source "
                    f"{document_id}"
                )
            )


            # =================================================
            # Document detail
            # =================================================

            response = (
                await client.get(
                    (
                        "/documents/"
                        f"{document_id}"
                    )
                )
            )

            response.raise_for_status()


            print_ok(
                "Document ownership/detail"
            )


            # =================================================
            # RAG indexing
            # =================================================

            response = (
                await client.post(
                    (
                        "/rag/index/"
                        f"{document_id}"
                    )
                )
            )

            response.raise_for_status()


            rag_index = (
                response.json()
            )


            if (
                rag_index.get(
                    "chunk_count",
                    0,
                )
                <= 0
            ):

                raise RuntimeError(
                    "RAG created zero chunks."
                )


            print_ok(
                (
                    "Supabase pgvector "
                    "RAG indexing"
                )
            )


            # =================================================
            # RAG retrieval
            # =================================================

            response = (
                await client.post(
                    "/rag/query",

                    json={
                        "query":
                            (
                                "What response "
                                "actions were "
                                "recommended?"
                            ),

                        "document_id":
                            document_id,

                        "top_k":
                            5,

                        "min_similarity":
                            0.0,
                    },
                )
            )

            response.raise_for_status()


            rag_query = (
                response.json()
            )


            if (
                rag_query.get(
                    "result_count",
                    0,
                )
                <= 0
            ):

                raise RuntimeError(
                    "RAG retrieval "
                    "returned no results."
                )


            print_ok(
                "Semantic RAG retrieval"
            )


            # =================================================
            # Transformation
            # =================================================

            response = (
                await client.post(
                    "/transformations",

                    json={
                        "document_id":
                            document_id,

                        "target_audience":
                            (
                                "Senior "
                                "Leadership"
                            ),

                        "tone":
                            "Professional",

                        "language":
                            "English",

                        "detail_level":
                            "balanced",

                        "objective":
                            (
                                "Explain the "
                                "incident, response "
                                "and recommended "
                                "next actions."
                            ),

                        "selected_outputs": [
                            "executive_summary",
                            "linkedin",
                        ],

                        "custom_instructions":
                            (
                                "Preserve important "
                                "facts and do not "
                                "invent information."
                            ),

                        "use_rag":
                            True,
                    },
                )
            )

            response.raise_for_status()


            transformation = (
                response.json()
            )


            transformation_id = str(
                transformation[
                    "transformation_id"
                ]
            )


            outputs = (
                transformation.get(
                    "outputs",
                    []
                )
            )


            if (
                len(
                    outputs
                )
                < 1
            ):

                raise RuntimeError(
                    "Transformation returned "
                    "no outputs."
                )


            print_ok(
                (
                    "Gemini transformation "
                    f"{transformation_id}"
                )
            )


            # =================================================
            # Transformation detail
            # =================================================

            response = (
                await client.get(
                    (
                        "/transformations/"
                        f"{transformation_id}"
                    )
                )
            )

            response.raise_for_status()


            detail = (
                response.json()
            )


            analysis = (
                detail.get(
                    "analysis",
                    {}
                )
            )


            if analysis:

                coverage = (
                    analysis.get(
                        "coverage"
                    )
                )


                confidence = (
                    analysis.get(
                        "confidence"
                    )
                )


                if coverage:

                    print(
                        (
                            "     Coverage: "
                            f"{coverage}"
                        )
                    )


                if confidence:

                    print(
                        (
                            "     Confidence: "
                            f"{confidence}"
                        )
                    )


            print_ok(
                "Transformation persistence"
            )


            # =================================================
            # JSON export
            # =================================================

            response = (
                await client.post(
                    (
                        "/exports/"
                        f"{transformation_id}"
                        "/generate"
                    ),

                    json={
                        "formats": [
                            "json",
                        ],

                        "include_output_types":
                            None,
                    },
                )
            )

            response.raise_for_status()


            export_payload = (
                response.json()
            )


            artifacts = (
                export_payload.get(
                    "artifacts",
                    []
                )
            )


            if not artifacts:

                raise RuntimeError(
                    "Export generation "
                    "returned no artifact."
                )


            print_ok(
                "Export generation"
            )


            # =================================================
            # Signed URL
            # =================================================

            export_id = str(
                artifacts[
                    0
                ][
                    "id"
                ]
            )


            response = (
                await client.get(
                    (
                        "/exports/files/"
                        f"{export_id}"
                        "/download-url"
                    )
                )
            )

            response.raise_for_status()


            signed_payload = (
                response.json()
            )


            if not signed_payload.get(
                "signed_url"
            ):

                raise RuntimeError(
                    "Signed download URL missing."
                )


            print_ok(
                "Private signed export URL"
            )


            # =================================================
            # Dashboard analytics
            # =================================================

            response = (
                await client.get(
                    "/dashboard/overview"
                )
            )

            response.raise_for_status()


            print_ok(
                "Dashboard overview"
            )


            response = (
                await client.get(
                    "/dashboard/analytics"
                )
            )

            response.raise_for_status()


            print_ok(
                "Dashboard analytics"
            )


            print(
                "\n========================================"
            )

            print(
                "TERMINAL_E2E_OK"
            )

            print(
                "========================================\n"
            )


        finally:

            # =================================================
            # Cleanup E2E data
            # =================================================

            if (
                transformation_id
                is not None
            ):

                try:

                    await client.delete(
                        (
                            "/transformations/"
                            f"{transformation_id}"
                        )
                    )

                    print_ok(
                        "E2E transformation cleanup"
                    )

                except Exception:

                    pass


            if (
                document_id
                is not None
            ):

                try:

                    await client.delete(
                        (
                            "/documents/"
                            f"{document_id}"
                        )
                    )

                    print_ok(
                        "E2E document cleanup"
                    )

                except Exception:

                    pass


if __name__ == "__main__":

    asyncio.run(
        main()
    )