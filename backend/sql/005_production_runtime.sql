-- ============================================================
-- SIH26154
-- Migration 005
--
-- FINAL PRE-BROWSER PRODUCTION RUNTIME
--
-- Adds:
--   1. pgvector production RAG storage
--   2. HNSW cosine search index
--   3. RAG matching RPC
--   4. auth.users -> profiles trigger
--   5. profile backfill
--   6. private Storage bucket hardening
--   7. user-isolated Storage RLS
--   8. distributed database-backed rate limiting
--
-- Run AFTER:
--   001_initial_schema.sql
--   002_exported_files.sql
--   003_schema_alignment_and_security.sql
--   004_video_support.sql
-- ============================================================


begin;


-- ============================================================
-- PGVECTOR
-- ============================================================


create extension if not exists vector
with schema extensions;


-- ============================================================
-- PRODUCTION RAG CHUNKS
-- ============================================================


create table if not exists public.rag_chunks (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    source_document_id uuid not null
        references public.source_documents(id)
        on delete cascade,

    chunk_index integer not null
        check (chunk_index >= 0),

    content text not null
        check (length(content) > 0),

    content_hash text not null,

    metadata jsonb not null
        default '{}'::jsonb,

    embedding extensions.vector(768)
        not null,

    created_at timestamptz not null
        default now(),

    unique (
        source_document_id,
        chunk_index
    )
);


alter table public.rag_chunks
enable row level security;


-- ============================================================
-- RAG POLICIES
-- ============================================================


drop policy if exists
"Users can read own RAG chunks"
on public.rag_chunks;


create policy
"Users can read own RAG chunks"
on public.rag_chunks
for select
to authenticated
using (
    user_id = (
        select auth.uid()
    )
);


drop policy if exists
"Users can insert own RAG chunks"
on public.rag_chunks;


create policy
"Users can insert own RAG chunks"
on public.rag_chunks
for insert
to authenticated
with check (
    user_id = (
        select auth.uid()
    )
);


drop policy if exists
"Users can update own RAG chunks"
on public.rag_chunks;


create policy
"Users can update own RAG chunks"
on public.rag_chunks
for update
to authenticated
using (
    user_id = (
        select auth.uid()
    )
)
with check (
    user_id = (
        select auth.uid()
    )
);


drop policy if exists
"Users can delete own RAG chunks"
on public.rag_chunks;


create policy
"Users can delete own RAG chunks"
on public.rag_chunks
for delete
to authenticated
using (
    user_id = (
        select auth.uid()
    )
);


-- ============================================================
-- RAG INDEXES
-- ============================================================


create index if not exists
idx_rag_chunks_user_document
on public.rag_chunks (
    user_id,
    source_document_id,
    chunk_index
);


create index if not exists
idx_rag_chunks_content_hash
on public.rag_chunks (
    content_hash
);


-- Supabase recommends HNSW for high-quality,
-- low-latency approximate vector retrieval.

create index if not exists
idx_rag_chunks_embedding_hnsw
on public.rag_chunks
using hnsw (
    embedding vector_cosine_ops
);


-- Ensure one RAG index state per source.

create unique index if not exists
idx_rag_indexes_source_document_unique
on public.rag_indexes (
    source_document_id
);


-- ============================================================
-- SEMANTIC SEARCH RPC
-- ============================================================


create or replace function public.match_rag_chunks(
    query_embedding extensions.vector(768),

    match_user_id uuid,

    match_document_id uuid default null,

    match_count integer default 8,

    min_similarity double precision default 0.0
)
returns table (
    id uuid,

    source_document_id uuid,

    chunk_index integer,

    content text,

    metadata jsonb,

    similarity double precision
)
language sql
stable
security definer
set search_path = ''
as $$

    select
        rc.id,

        rc.source_document_id,

        rc.chunk_index,

        rc.content,

        rc.metadata,

        (
            1
            -
            (
                rc.embedding
                <=>
                query_embedding
            )
        )::double precision
        as similarity

    from public.rag_chunks rc

    where
        rc.user_id = match_user_id

        and (
            match_document_id is null

            or rc.source_document_id
               = match_document_id
        )

        and (
            1
            -
            (
                rc.embedding
                <=>
                query_embedding
            )
        ) >= min_similarity

    order by
        rc.embedding
        <=>
        query_embedding

    limit greatest(
        1,
        least(
            match_count,
            50
        )
    );

$$;


revoke all
on function public.match_rag_chunks(
    extensions.vector,
    uuid,
    uuid,
    integer,
    double precision
)
from public;


revoke all
on function public.match_rag_chunks(
    extensions.vector,
    uuid,
    uuid,
    integer,
    double precision
)
from anon;


revoke all
on function public.match_rag_chunks(
    extensions.vector,
    uuid,
    uuid,
    integer,
    double precision
)
from authenticated;


grant execute
on function public.match_rag_chunks(
    extensions.vector,
    uuid,
    uuid,
    integer,
    double precision
)
to service_role;


-- ============================================================
-- PROFILE CREATION
--
-- Never accept a role from raw user metadata.
-- Every normal signup is always "user".
-- ============================================================


create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$

begin

    insert into public.profiles (
        id,
        full_name,
        avatar_url,
        role,
        created_at,
        updated_at
    )
    values (
        new.id,

        nullif(
            btrim(
                coalesce(
                    new.raw_user_meta_data
                        ->> 'full_name',

                    new.raw_user_meta_data
                        ->> 'name',

                    ''
                )
            ),
            ''
        ),

        nullif(
            btrim(
                coalesce(
                    new.raw_user_meta_data
                        ->> 'avatar_url',

                    new.raw_user_meta_data
                        ->> 'picture',

                    ''
                )
            ),
            ''
        ),

        'user',

        now(),

        now()
    )

    on conflict (
        id
    )
    do update

    set
        full_name = coalesce(
            excluded.full_name,
            public.profiles.full_name
        ),

        avatar_url = coalesce(
            excluded.avatar_url,
            public.profiles.avatar_url
        ),

        updated_at = now();


    return new;

end;

$$;


drop trigger if exists
on_auth_user_created
on auth.users;


create trigger
on_auth_user_created

after insert
on auth.users

for each row

execute function
public.handle_new_auth_user();


-- ============================================================
-- BACKFILL EXISTING USERS
-- ============================================================


insert into public.profiles (
    id,
    full_name,
    avatar_url,
    role,
    created_at,
    updated_at
)

select
    users.id,

    nullif(
        btrim(
            coalesce(
                users.raw_user_meta_data
                    ->> 'full_name',

                users.raw_user_meta_data
                    ->> 'name',

                ''
            )
        ),
        ''
    ),

    nullif(
        btrim(
            coalesce(
                users.raw_user_meta_data
                    ->> 'avatar_url',

                users.raw_user_meta_data
                    ->> 'picture',

                ''
            )
        ),
        ''
    ),

    'user',

    coalesce(
        users.created_at,
        now()
    ),

    now()

from auth.users users

on conflict (
    id
)
do nothing;


-- ============================================================
-- STORAGE BUCKETS
-- ============================================================


insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)

values (
    'documents',

    'documents',

    false,

    52428800,

    array[
        'application/pdf',

        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

        'application/json',

        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

        'text/plain',

        'text/markdown',

        'text/csv',

        'image/png',

        'image/jpeg',

        'image/webp',

        'image/bmp',

        'image/tiff',

        'video/mp4',

        'video/mov',

        'video/quicktime',

        'video/webm'
    ]::text[]
)

on conflict (
    id
)
do update

set
    public = false,

    file_size_limit =
        excluded.file_size_limit,

    allowed_mime_types =
        excluded.allowed_mime_types;


insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)

values (
    'generated-outputs',

    'generated-outputs',

    false,

    52428800,

    array[
        'application/pdf',

        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

        'application/vnd.openxmlformats-officedocument.presentationml.presentation',

        'application/json',

        'text/csv',

        'text/plain',

        'application/x-subrip'
    ]::text[]
)

on conflict (
    id
)
do update

set
    public = false,

    file_size_limit =
        excluded.file_size_limit,

    allowed_mime_types =
        excluded.allowed_mime_types;


-- ============================================================
-- STORAGE RLS
--
-- Object path convention:
--
-- {user_uuid}/sources/...
-- {user_uuid}/exports/...
-- ============================================================


drop policy if exists
"Users can read own source files"
on storage.objects;


create policy
"Users can read own source files"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'documents'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
);


drop policy if exists
"Users can upload own source files"
on storage.objects;


create policy
"Users can upload own source files"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'documents'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
);


drop policy if exists
"Users can update own source files"
on storage.objects;


create policy
"Users can update own source files"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'documents'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
)
with check (
    bucket_id = 'documents'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
);


drop policy if exists
"Users can delete own source files"
on storage.objects;


create policy
"Users can delete own source files"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'documents'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
);


drop policy if exists
"Users can read own generated files"
on storage.objects;


create policy
"Users can read own generated files"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'generated-outputs'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
);


drop policy if exists
"Users can upload own generated files"
on storage.objects;


create policy
"Users can upload own generated files"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'generated-outputs'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
);


drop policy if exists
"Users can update own generated files"
on storage.objects;


create policy
"Users can update own generated files"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'generated-outputs'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
)
with check (
    bucket_id = 'generated-outputs'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
);


drop policy if exists
"Users can delete own generated files"
on storage.objects;


create policy
"Users can delete own generated files"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'generated-outputs'

    and (
        storage.foldername(
            name
        )
    )[1] = (
        select auth.uid()::text
    )
);


-- ============================================================
-- DISTRIBUTED RATE LIMITING
--
-- Works across multiple backend instances because
-- counters live in PostgreSQL rather than process memory.
-- ============================================================


create table if not exists public.api_rate_limits (
    key_hash text not null,

    window_start timestamptz not null,

    request_count integer not null
        default 0
        check (
            request_count >= 0
        ),

    primary key (
        key_hash,
        window_start
    )
);


alter table public.api_rate_limits
enable row level security;


-- No direct authenticated/anon policies.
-- Backend service_role accesses via RPC only.


create index if not exists
idx_api_rate_limits_window
on public.api_rate_limits (
    window_start
);


create or replace function public.consume_rate_limit(
    p_key_hash text,

    p_limit integer,

    p_window_seconds integer
)
returns table (
    allowed boolean,

    remaining integer,

    reset_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$

declare

    v_now timestamptz;

    v_window_start timestamptz;

    v_count integer;

begin

    if p_limit < 1 then

        raise exception
        'p_limit must be greater than zero';

    end if;


    if p_window_seconds < 1 then

        raise exception
        'p_window_seconds must be greater than zero';

    end if;


    v_now :=
        clock_timestamp();


    v_window_start :=
        to_timestamp(
            floor(
                extract(
                    epoch
                    from v_now
                )
                /
                p_window_seconds
            )
            *
            p_window_seconds
        );


    insert into public.api_rate_limits
        as limits (
            key_hash,
            window_start,
            request_count
        )

    values (
        p_key_hash,
        v_window_start,
        1
    )

    on conflict (
        key_hash,
        window_start
    )

    do update

    set request_count =
        limits.request_count + 1

    returning
        request_count
    into
        v_count;


    allowed :=
        v_count <= p_limit;


    remaining :=
        greatest(
            p_limit - v_count,
            0
        );


    reset_at :=
        v_window_start
        +
        make_interval(
            secs =>
                p_window_seconds
        );


    return next;

end;

$$;


revoke all
on function public.consume_rate_limit(
    text,
    integer,
    integer
)
from public;


revoke all
on function public.consume_rate_limit(
    text,
    integer,
    integer
)
from anon;


revoke all
on function public.consume_rate_limit(
    text,
    integer,
    integer
)
from authenticated;


grant execute
on function public.consume_rate_limit(
    text,
    integer,
    integer
)
to service_role;


-- ============================================================
-- RATE LIMIT CLEANUP
-- ============================================================


create or replace function public.cleanup_api_rate_limits()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$

declare

    deleted_rows bigint;

begin

    delete
    from public.api_rate_limits

    where window_start
        <
        now()
        -
        interval '2 days';


    get diagnostics
        deleted_rows =
        row_count;


    return deleted_rows;

end;

$$;


revoke all
on function public.cleanup_api_rate_limits()
from public;


revoke all
on function public.cleanup_api_rate_limits()
from anon;


revoke all
on function public.cleanup_api_rate_limits()
from authenticated;


grant execute
on function public.cleanup_api_rate_limits()
to service_role;


commit;