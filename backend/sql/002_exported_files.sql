-- ============================================================
-- SIH26154
-- Exported Files Schema
-- ============================================================


create table if not exists public.exported_files (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    transformation_id uuid not null
        references public.transformations(id)
        on delete cascade,

    export_format text not null
        check (
            export_format in (
                'pdf',
                'docx',
                'pptx',
                'json',
                'csv',
                'srt'
            )
        ),

    filename text not null,

    mime_type text not null,

    file_size bigint not null default 0,

    storage_path text not null,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_exported_files_user_id
on public.exported_files(user_id);


create index if not exists idx_exported_files_transformation_id
on public.exported_files(transformation_id);


create index if not exists idx_exported_files_created_at
on public.exported_files(created_at desc);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.exported_files
enable row level security;


drop policy if exists
"Users can view own exported files"
on public.exported_files;


create policy
"Users can view own exported files"
on public.exported_files
for select
using (
    auth.uid() = user_id
);


drop policy if exists
"Users can insert own exported files"
on public.exported_files;


create policy
"Users can insert own exported files"
on public.exported_files
for insert
with check (
    auth.uid() = user_id
);


drop policy if exists
"Users can delete own exported files"
on public.exported_files;


create policy
"Users can delete own exported files"
on public.exported_files
for delete
using (
    auth.uid() = user_id
);