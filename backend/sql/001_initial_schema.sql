-- ============================================================
-- SIH26154 - GenAI Content Transformation Platform
-- Initial PostgreSQL / Supabase Schema
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- PROFILES
-- ============================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    role text not null default 'user'
        check (role in ('user', 'admin')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- SOURCE DOCUMENTS
-- ============================================================

create table if not exists public.source_documents (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    original_filename text not null,
    mime_type text not null,
    file_size bigint not null default 0,

    input_type text not null
        check (
            input_type in (
                'pdf',
                'docx',
                'text',
                'image',
                'csv',
                'xlsx',
                'json'
            )
        ),

    storage_path text,

    status text not null default 'uploaded'
        check (
            status in (
                'uploaded',
                'processing',
                'ready',
                'failed'
            )
        ),

    extraction_method text,

    page_count integer not null default 0,
    character_count integer not null default 0,

    extracted_text text,

    metadata jsonb not null default '{}'::jsonb,

    error_message text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- TRANSFORMATIONS
-- ============================================================

create table if not exists public.transformations (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    source_document_id uuid
        references public.source_documents(id)
        on delete set null,

    title text,

    status text not null default 'pending'
        check (
            status in (
                'pending',
                'processing',
                'completed',
                'failed'
            )
        ),

    target_audience text,
    tone text,
    language text not null default 'English',
    detail_level text,
    objective text,

    selected_outputs text[] not null default '{}',

    custom_instructions text,

    source_snapshot jsonb not null default '{}'::jsonb,
    analysis_json jsonb not null default '{}'::jsonb,

    error_message text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- GENERATED OUTPUTS
-- ============================================================

create table if not exists public.generated_outputs (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    transformation_id uuid not null
        references public.transformations(id)
        on delete cascade,

    output_type text not null,

    title text,

    content_text text,

    content_json jsonb not null default '{}'::jsonb,

    storage_path text,
    mime_type text,

    created_at timestamptz not null default now()
);


-- ============================================================
-- RAG INDEX STATE
-- ============================================================

create table if not exists public.rag_indexes (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    source_document_id uuid not null unique
        references public.source_documents(id)
        on delete cascade,

    provider text not null default 'chroma',

    collection_name text,

    chunk_count integer not null default 0,

    status text not null default 'pending'
        check (
            status in (
                'pending',
                'indexing',
                'ready',
                'failed'
            )
        ),

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- ACTIVITY / ANALYTICS
-- ============================================================

create table if not exists public.activity_events (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    event_type text not null,

    source_document_id uuid
        references public.source_documents(id)
        on delete cascade,

    transformation_id uuid
        references public.transformations(id)
        on delete cascade,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_source_documents_user_id
on public.source_documents(user_id);

create index if not exists idx_source_documents_created_at
on public.source_documents(created_at desc);

create index if not exists idx_transformations_user_id
on public.transformations(user_id);

create index if not exists idx_transformations_document_id
on public.transformations(source_document_id);

create index if not exists idx_generated_outputs_transformation_id
on public.generated_outputs(transformation_id);

create index if not exists idx_generated_outputs_user_id
on public.generated_outputs(user_id);

create index if not exists idx_activity_events_user_id
on public.activity_events(user_id);

create index if not exists idx_activity_events_created_at
on public.activity_events(created_at desc);


-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


drop trigger if exists profiles_set_updated_at
on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


drop trigger if exists source_documents_set_updated_at
on public.source_documents;

create trigger source_documents_set_updated_at
before update on public.source_documents
for each row
execute function public.set_updated_at();


drop trigger if exists transformations_set_updated_at
on public.transformations;

create trigger transformations_set_updated_at
before update on public.transformations
for each row
execute function public.set_updated_at();


drop trigger if exists rag_indexes_set_updated_at
on public.rag_indexes;

create trigger rag_indexes_set_updated_at
before update on public.rag_indexes
for each row
execute function public.set_updated_at();


-- ============================================================
-- CREATE PROFILE AUTOMATICALLY AFTER USER SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

    insert into public.profiles (
        id,
        full_name,
        avatar_url
    )
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name',
            ''
        ),
        new.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do nothing;

    return new;

end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.source_documents enable row level security;
alter table public.transformations enable row level security;
alter table public.generated_outputs enable row level security;
alter table public.rag_indexes enable row level security;
alter table public.activity_events enable row level security;


-- ============================================================
-- PROFILE POLICIES
-- ============================================================

drop policy if exists "Users can view own profile"
on public.profiles;

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);


drop policy if exists "Users can update own profile"
on public.profiles;

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);


-- ============================================================
-- SOURCE DOCUMENT POLICIES
-- ============================================================

drop policy if exists "Users can view own source documents"
on public.source_documents;

create policy "Users can view own source documents"
on public.source_documents
for select
using (auth.uid() = user_id);


drop policy if exists "Users can insert own source documents"
on public.source_documents;

create policy "Users can insert own source documents"
on public.source_documents
for insert
with check (auth.uid() = user_id);


drop policy if exists "Users can update own source documents"
on public.source_documents;

create policy "Users can update own source documents"
on public.source_documents
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


drop policy if exists "Users can delete own source documents"
on public.source_documents;

create policy "Users can delete own source documents"
on public.source_documents
for delete
using (auth.uid() = user_id);


-- ============================================================
-- TRANSFORMATION POLICIES
-- ============================================================

drop policy if exists "Users can view own transformations"
on public.transformations;

create policy "Users can view own transformations"
on public.transformations
for select
using (auth.uid() = user_id);


drop policy if exists "Users can insert own transformations"
on public.transformations;

create policy "Users can insert own transformations"
on public.transformations
for insert
with check (auth.uid() = user_id);


drop policy if exists "Users can update own transformations"
on public.transformations;

create policy "Users can update own transformations"
on public.transformations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


drop policy if exists "Users can delete own transformations"
on public.transformations;

create policy "Users can delete own transformations"
on public.transformations
for delete
using (auth.uid() = user_id);


-- ============================================================
-- GENERATED OUTPUT POLICIES
-- ============================================================

drop policy if exists "Users can view own outputs"
on public.generated_outputs;

create policy "Users can view own outputs"
on public.generated_outputs
for select
using (auth.uid() = user_id);


drop policy if exists "Users can insert own outputs"
on public.generated_outputs;

create policy "Users can insert own outputs"
on public.generated_outputs
for insert
with check (auth.uid() = user_id);


drop policy if exists "Users can delete own outputs"
on public.generated_outputs;

create policy "Users can delete own outputs"
on public.generated_outputs
for delete
using (auth.uid() = user_id);


-- ============================================================
-- RAG POLICIES
-- ============================================================

drop policy if exists "Users can view own rag indexes"
on public.rag_indexes;

create policy "Users can view own rag indexes"
on public.rag_indexes
for select
using (auth.uid() = user_id);


drop policy if exists "Users can insert own rag indexes"
on public.rag_indexes;

create policy "Users can insert own rag indexes"
on public.rag_indexes
for insert
with check (auth.uid() = user_id);


drop policy if exists "Users can update own rag indexes"
on public.rag_indexes;

create policy "Users can update own rag indexes"
on public.rag_indexes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ============================================================
-- ACTIVITY POLICIES
-- ============================================================

drop policy if exists "Users can view own activity"
on public.activity_events;

create policy "Users can view own activity"
on public.activity_events
for select
using (auth.uid() = user_id);


drop policy if exists "Users can insert own activity"
on public.activity_events;

create policy "Users can insert own activity"
on public.activity_events
for insert
with check (auth.uid() = user_id);


-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (
    id,
    name,
    public
)
values (
    'documents',
    'documents',
    false
)
on conflict (id) do nothing;


insert into storage.buckets (
    id,
    name,
    public
)
values (
    'generated-outputs',
    'generated-outputs',
    false
)
on conflict (id) do nothing;


-- ============================================================
-- DOCUMENT STORAGE POLICIES
-- Folder structure:
-- <user_id>/sources/...
-- ============================================================

drop policy if exists "Users can upload own documents"
on storage.objects;

create policy "Users can upload own documents"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'documents'
    and
    (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists "Users can view own documents"
on storage.objects;

create policy "Users can view own documents"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'documents'
    and
    (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists "Users can update own documents"
on storage.objects;

create policy "Users can update own documents"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'documents'
    and
    (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists "Users can delete own documents"
on storage.objects;

create policy "Users can delete own documents"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'documents'
    and
    (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- GENERATED OUTPUT STORAGE POLICIES
-- ============================================================

drop policy if exists "Users can upload own generated outputs"
on storage.objects;

create policy "Users can upload own generated outputs"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'generated-outputs'
    and
    (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists "Users can view own generated outputs"
on storage.objects;

create policy "Users can view own generated outputs"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'generated-outputs'
    and
    (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists "Users can delete own generated outputs"
on storage.objects;

create policy "Users can delete own generated outputs"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'generated-outputs'
    and
    (storage.foldername(name))[1] = auth.uid()::text
);