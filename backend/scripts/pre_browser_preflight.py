from __future__ import annotations

from uuid import (
    UUID,
)

from app.core.config import (
    settings,
)

from app.core.supabase import (
    get_supabase_admin_client,
)

from app.services.video.ffmpeg_service import (
    ffmpeg_video_service,
)


REQUIRED_TABLES = {
    "profiles":
        "id,full_name,avatar_url,role",

    "source_documents":
        (
            "id,user_id,original_filename,"
            "input_type,status,error_message"
        ),

    "transformations":
        (
            "id,user_id,source_document_id,"
            "status,error_message"
        ),

    "generated_outputs":
        (
            "id,user_id,transformation_id,"
            "output_type"
        ),

    "rag_indexes":
        (
            "id,user_id,source_document_id,"
            "status,chunk_count"
        ),

    "rag_chunks":
        (
            "id,user_id,source_document_id,"
            "chunk_index,content_hash"
        ),

    "activity_events":
        (
            "id,user_id,event_type"
        ),

    "exported_files":
        (
            "id,user_id,transformation_id,"
            "export_format"
        ),

    "api_rate_limits":
        (
            "key_hash,window_start,"
            "request_count"
        ),
}


def require_value(
    name: str,
    value: str | None,
) -> None:

    if (
        not value
        or not value.strip()
    ):

        raise RuntimeError(
            f"{name} is not configured."
        )


def main() -> None:

    print(
        "\n========================================"
    )

    print(
        "SIH26154 PRE-BROWSER PREFLIGHT"
    )

    print(
        "========================================\n"
    )


    require_value(
        "GEMINI_API_KEY",
        settings.gemini_api_key,
    )


    require_value(
        "SUPABASE_URL",
        settings.supabase_url,
    )


    require_value(
        "SUPABASE_ANON_KEY",
        settings.supabase_anon_key,
    )


    require_value(
        "SUPABASE_SERVICE_ROLE_KEY",
        settings.supabase_service_role_key,
    )


    print(
        "[OK] Required secrets configured"
    )


    if (
        int(
            settings
            .gemini_embedding_dimensions
        )
        != 768
    ):

        raise RuntimeError(
            (
                "Production pgvector schema "
                "expects 768 embedding "
                "dimensions."
            )
        )


    print(
        "[OK] Embedding dimensions = 768"
    )


    ffmpeg_video_service.ensure_available()


    print(
        "[OK] FFmpeg + FFprobe available"
    )


    admin = (
        get_supabase_admin_client()
    )


    for (
        table,
        columns,
    ) in (
        REQUIRED_TABLES.items()
    ):

        (
            admin
            .table(
                table
            )
            .select(
                columns
            )
            .limit(
                1
            )
            .execute()
        )


        print(
            f"[OK] Database table: {table}"
        )


    # --------------------------------------------------------
    # Storage buckets
    # --------------------------------------------------------

    admin.storage.get_bucket(
        settings.supabase_document_bucket
    )


    print(
        (
            "[OK] Storage bucket: "
            f"{settings.supabase_document_bucket}"
        )
    )


    admin.storage.get_bucket(
        settings.supabase_output_bucket
    )


    print(
        (
            "[OK] Storage bucket: "
            f"{settings.supabase_output_bucket}"
        )
    )


    # --------------------------------------------------------
    # Vector RPC
    #
    # Use a non-zero 768-dimension vector.
    # The all-zero vector is unsuitable for cosine distance.
    # --------------------------------------------------------

    probe_vector = [
        0.0
        for _
        in range(
            768
        )
    ]


    probe_vector[
        0
    ] = 1.0


    (
        admin.rpc(
            "match_rag_chunks",

            {
                "query_embedding":
                    probe_vector,

                "match_user_id":
                    str(
                        UUID(
                            int=0
                        )
                    ),

                "match_document_id":
                    None,

                "match_count":
                    1,

                "min_similarity":
                    0.0,
            },
        )
        .execute()
    )


    print(
        "[OK] pgvector match_rag_chunks RPC"
    )


    # --------------------------------------------------------
    # Distributed rate-limit RPC
    # --------------------------------------------------------

    rate_result = (
        admin.rpc(
            "consume_rate_limit",

            {
                "p_key_hash":
                    (
                        "preflight-"
                        "sih26154"
                    ),

                "p_limit":
                    1000,

                "p_window_seconds":
                    60,
            },
        )
        .execute()
    )


    if not rate_result.data:

        raise RuntimeError(
            "Rate-limit RPC returned no data."
        )


    print(
        "[OK] Distributed rate-limit RPC"
    )


    print(
        "\n========================================"
    )

    print(
        "PRE_BROWSER_PREFLIGHT_OK"
    )

    print(
        "========================================\n"
    )


if __name__ == "__main__":

    main()