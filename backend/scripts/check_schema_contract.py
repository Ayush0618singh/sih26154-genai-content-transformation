from app.core.supabase import (
    get_supabase_admin_client,
)


TABLE_CONTRACTS = {
    "profiles": (
        "id, full_name, avatar_url, "
        "role, created_at, updated_at"
    ),

    "source_documents": (
        "id, user_id, original_filename, "
        "mime_type, file_size, input_type, "
        "storage_path, status, "
        "extraction_method, page_count, "
        "character_count, extracted_text, "
        "metadata, error_message, "
        "created_at, updated_at"
    ),

    "transformations": (
        "id, user_id, source_document_id, "
        "title, status, target_audience, "
        "tone, language, detail_level, "
        "objective, selected_outputs, "
        "custom_instructions, "
        "source_snapshot, analysis_json, "
        "error_message, "
        "created_at, updated_at"
    ),

    "generated_outputs": (
        "id, user_id, transformation_id, "
        "output_type, title, content_text, "
        "content_json, storage_path, "
        "mime_type, created_at"
    ),

    "rag_indexes": (
        "id, user_id, source_document_id, "
        "status, chunk_count, created_at"
    ),

    "activity_events": (
        "id, user_id, event_type, "
        "source_document_id, "
        "transformation_id, metadata, "
        "created_at"
    ),

    "exported_files": (
        "id, user_id, transformation_id, "
        "export_format, filename, mime_type, "
        "file_size, storage_path, metadata, "
        "created_at"
    ),
}


def main() -> None:

    admin = (
        get_supabase_admin_client()
    )


    print(
        "Checking database schema contract...\n"
    )


    for (
        table,
        columns,
    ) in TABLE_CONTRACTS.items():

        (
            admin.table(
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
            f"[OK] {table}"
        )


    print(
        "\nDATABASE_SCHEMA_CONTRACT_OK"
    )


if __name__ == "__main__":

    main()