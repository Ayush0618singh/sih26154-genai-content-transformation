-- ============================================================
-- SIH26154
-- Migration 004
--
-- Video input support:
--   MP4
--   MOV
--   WebM
--
-- Run AFTER:
--   001_initial_schema.sql
--   002_exported_files.sql
--   003_schema_alignment_and_security.sql
-- ============================================================


begin;


-- ============================================================
-- SOURCE DOCUMENT INPUT TYPE
--
-- Remove any earlier CHECK constraint that restricts
-- source_documents.input_type and replace it with the
-- finalized set that includes video.
-- ============================================================


do $$
declare
    constraint_record record;
begin

    for constraint_record in
        select
            con.conname
        from pg_constraint con
        join pg_class rel
            on rel.oid = con.conrelid
        join pg_namespace nsp
            on nsp.oid = rel.relnamespace
        where nsp.nspname = 'public'
          and rel.relname = 'source_documents'
          and con.contype = 'c'
          and pg_get_constraintdef(con.oid)
              ilike '%input_type%'
    loop

        execute format(
            'alter table public.source_documents drop constraint %I',
            constraint_record.conname
        );

    end loop;

end $$;


alter table public.source_documents
add constraint source_documents_input_type_check
check (
    input_type in (
        'text',
        'pdf',
        'docx',
        'image',
        'csv',
        'xlsx',
        'json',
        'video'
    )
);


-- ============================================================
-- STORAGE MIME ALLOW-LIST
--
-- Only modify an existing allow-list.
-- NULL means the bucket is currently unrestricted.
-- ============================================================


update storage.buckets
set allowed_mime_types = (
    select array(
        select distinct value
        from unnest(
            coalesce(
                allowed_mime_types,
                array[]::text[]
            )
            ||
            array[
                'video/mp4',
                'video/mov',
                'video/quicktime',
                'video/webm'
            ]::text[]
        ) as value
    )
)
where id in (
    'documents',
    'generated-outputs'
)
and allowed_mime_types is not null;


commit;