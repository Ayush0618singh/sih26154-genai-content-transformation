-- ============================================================
-- SIH26154
-- Migration 003
--
-- Purpose:
--   1. Align legacy column names with the final API contract.
--   2. Add profile fields expected by the frontend.
--   3. Make migration idempotent.
--
-- Run AFTER:
--   001_initial_schema.sql
--   002_exported_files.sql
-- ============================================================


begin;


-- ============================================================
-- SOURCE DOCUMENTS
-- ============================================================


do $$
begin

    -- Legacy:
    -- filename
    --
    -- Final:
    -- original_filename

    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'source_documents'
          and column_name = 'filename'
    )
    and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'source_documents'
          and column_name = 'original_filename'
    )
    then
        alter table public.source_documents
        rename column filename
        to original_filename;
    end if;


    -- Legacy:
    -- error
    --
    -- Final:
    -- error_message

    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'source_documents'
          and column_name = 'error'
    )
    and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'source_documents'
          and column_name = 'error_message'
    )
    then
        alter table public.source_documents
        rename column error
        to error_message;
    end if;

end $$;


-- If an early development database somehow has neither column,
-- create the final column safely.

alter table public.source_documents
add column if not exists original_filename text;

alter table public.source_documents
add column if not exists error_message text;


update public.source_documents
set original_filename = 'untitled-source'
where original_filename is null
   or btrim(original_filename) = '';


alter table public.source_documents
alter column original_filename
set not null;


-- ============================================================
-- TRANSFORMATIONS
-- ============================================================


do $$
begin

    -- Legacy:
    -- error
    --
    -- Final:
    -- error_message

    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'transformations'
          and column_name = 'error'
    )
    and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'transformations'
          and column_name = 'error_message'
    )
    then
        alter table public.transformations
        rename column error
        to error_message;
    end if;

end $$;


alter table public.transformations
add column if not exists error_message text;


-- ============================================================
-- PROFILES
-- ============================================================


alter table public.profiles
add column if not exists avatar_url text;


-- ============================================================
-- JSON DEFAULTS
-- ============================================================


alter table public.source_documents
alter column metadata
set default '{}'::jsonb;


alter table public.generated_outputs
alter column content_json
set default '{}'::jsonb;


alter table public.activity_events
alter column metadata
set default '{}'::jsonb;


-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================


create index if not exists
idx_source_documents_user_status
on public.source_documents (
    user_id,
    status
);


create index if not exists
idx_source_documents_user_created
on public.source_documents (
    user_id,
    created_at desc
);


create index if not exists
idx_transformations_user_status
on public.transformations (
    user_id,
    status
);


create index if not exists
idx_transformations_user_created
on public.transformations (
    user_id,
    created_at desc
);


create index if not exists
idx_generated_outputs_user_type
on public.generated_outputs (
    user_id,
    output_type
);


create index if not exists
idx_activity_events_user_created
on public.activity_events (
    user_id,
    created_at desc
);


commit;