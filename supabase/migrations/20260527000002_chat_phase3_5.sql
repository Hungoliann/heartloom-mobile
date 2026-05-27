-- =====================================================================
-- chat phase 3.5 — pin a message, @mentions, full-text search
-- safe to re-run (idempotent)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. messages.pinned_at — null means unpinned
-- ---------------------------------------------------------------------
alter table public.messages
  add column if not exists pinned_at timestamptz;

-- ---------------------------------------------------------------------
-- 2. message_mentions — composite PK, family-scoped via parent message
-- ---------------------------------------------------------------------
create table if not exists public.message_mentions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (message_id, user_id)
);
alter table public.message_mentions enable row level security;

drop policy if exists "message_mentions: read in family"   on public.message_mentions;
drop policy if exists "message_mentions: insert own"       on public.message_mentions;
drop policy if exists "message_mentions: delete own"       on public.message_mentions;

create policy "message_mentions: read in family"
  on public.message_mentions for select
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_mentions.message_id
        and m.family_id = public.my_family_id()
    )
  );

create policy "message_mentions: insert own"
  on public.message_mentions for insert
  with check (
    exists (
      select 1 from public.messages m
      where m.id = message_mentions.message_id
        and m.author_id = auth.uid()
        and m.family_id = public.my_family_id()
    )
  );

create policy "message_mentions: delete own"
  on public.message_mentions for delete
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_mentions.message_id
        and m.author_id = auth.uid()
    )
  );

do $$ begin
  alter publication supabase_realtime add table public.message_mentions;
exception when others then null; end $$;

-- ---------------------------------------------------------------------
-- 3. FTS on messages.body — 'simple' config (no stemming)
-- ---------------------------------------------------------------------
alter table public.messages
  add column if not exists body_tsv tsvector
  generated always as (to_tsvector('simple', coalesce(body, ''))) stored;

create index if not exists messages_body_tsv_idx
  on public.messages using gin (body_tsv);
