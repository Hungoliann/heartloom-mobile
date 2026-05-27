-- =====================================================================
-- heartloom-mobile — one-shot supabase setup
-- project ref: kttzkpxbqnhmbovalwfs
--
-- run this AFTER creating the storage buckets:
--   storage -> new bucket -> name=voice-memos, public=OFF
--   storage -> new bucket -> name=chat-images, public=OFF
--
-- paste the whole file into the supabase SQL editor and run.
-- safe to re-run (all statements are idempotent).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. letters.family_id nullable
--    mirrors migration 20260525000002_letters_family_id_nullable.sql
--    so a user can save a letter before they have joined/created a family
-- ---------------------------------------------------------------------
alter table public.letters alter column family_id drop not null;

-- ---------------------------------------------------------------------
-- 2. profiles.push_token column
--    expo push token stored on the profile row so the inngest delivery
--    worker can look it up without hitting auth.users metadata
-- ---------------------------------------------------------------------
alter table public.profiles add column if not exists push_token text;

-- ---------------------------------------------------------------------
-- 3. storage RLS policies for the `voice-memos` bucket
--    each user can only touch objects under their own ${auth.uid()}/ prefix
--    bucket itself must be created in the dashboard first
-- ---------------------------------------------------------------------

drop policy if exists "voice-memos: users can read own" on storage.objects;
create policy "voice-memos: users can read own"
  on storage.objects for select
  using (
    bucket_id = 'voice-memos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "voice-memos: users can insert own" on storage.objects;
create policy "voice-memos: users can insert own"
  on storage.objects for insert
  with check (
    bucket_id = 'voice-memos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "voice-memos: users can update own" on storage.objects;
create policy "voice-memos: users can update own"
  on storage.objects for update
  using (
    bucket_id = 'voice-memos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'voice-memos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "voice-memos: users can delete own" on storage.objects;
create policy "voice-memos: users can delete own"
  on storage.objects for delete
  using (
    bucket_id = 'voice-memos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- 4. CHAT phase 1 — extend messages, add read receipts + reactions, RLS
--    mirrors migration 20260526000000_chat_phase1.sql
--    safe to re-run (idempotent)
-- =====================================================================

-- 4a. extend public.messages
alter table public.messages add column if not exists media_url text;
alter table public.messages add column if not exists media_type text;
alter table public.messages add column if not exists shared_letter_id uuid references public.letters(id) on delete set null;
alter table public.messages add column if not exists reply_to_id uuid references public.messages(id) on delete set null;
alter table public.messages add column if not exists edited_at timestamptz;
alter table public.messages add column if not exists deleted_at timestamptz;

-- drop any existing check constraint that references message_type
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'messages'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%message_type%'
  loop
    execute format('alter table public.messages drop constraint %I', c.conname);
  end loop;
end $$;

-- 4b. index for family chat history
create index if not exists messages_family_created_idx
  on public.messages (family_id, created_at desc);

-- 4c. my_family_id() helper used by RLS policies
create or replace function public.my_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.profiles where id = auth.uid()
$$;

grant execute on function public.my_family_id() to authenticated;

-- 4d. message_reads
create table if not exists public.message_reads (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz default now() not null,
  primary key (family_id, user_id)
);
alter table public.message_reads enable row level security;

-- 4e. message_reactions
create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now() not null,
  primary key (message_id, user_id, emoji)
);
alter table public.message_reactions enable row level security;

-- 4f. RLS — messages (family-scoped via my_family_id())
drop policy if exists "users: own family messages"    on public.messages;
drop policy if exists "messages: read in family"      on public.messages;
drop policy if exists "messages: insert in family"    on public.messages;
drop policy if exists "messages: update own"          on public.messages;
drop policy if exists "messages: delete own"          on public.messages;

create policy "messages: read in family"
  on public.messages for select
  using (family_id = public.my_family_id());

create policy "messages: insert in family"
  on public.messages for insert
  with check (auth.uid() = author_id and family_id = public.my_family_id());

create policy "messages: update own"
  on public.messages for update
  using (auth.uid() = author_id and family_id = public.my_family_id())
  with check (auth.uid() = author_id and family_id = public.my_family_id());

create policy "messages: delete own"
  on public.messages for delete
  using (auth.uid() = author_id and family_id = public.my_family_id());

-- 4g. RLS — message_reads (own row only)
drop policy if exists "message_reads: select own"   on public.message_reads;
drop policy if exists "message_reads: insert own"   on public.message_reads;
drop policy if exists "message_reads: update own"   on public.message_reads;
drop policy if exists "message_reads: delete own"   on public.message_reads;

create policy "message_reads: select own"
  on public.message_reads for select
  using (auth.uid() = user_id and family_id = public.my_family_id());

create policy "message_reads: insert own"
  on public.message_reads for insert
  with check (auth.uid() = user_id and family_id = public.my_family_id());

create policy "message_reads: update own"
  on public.message_reads for update
  using (auth.uid() = user_id and family_id = public.my_family_id())
  with check (auth.uid() = user_id and family_id = public.my_family_id());

create policy "message_reads: delete own"
  on public.message_reads for delete
  using (auth.uid() = user_id and family_id = public.my_family_id());

-- 4h. RLS — message_reactions (read all in family, write own)
drop policy if exists "message_reactions: read in family"   on public.message_reactions;
drop policy if exists "message_reactions: insert own"       on public.message_reactions;
drop policy if exists "message_reactions: delete own"       on public.message_reactions;

create policy "message_reactions: read in family"
  on public.message_reactions for select
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_reactions.message_id
        and m.family_id = public.my_family_id()
    )
  );

create policy "message_reactions: insert own"
  on public.message_reactions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.messages m
      where m.id = message_reactions.message_id
        and m.family_id = public.my_family_id()
    )
  );

create policy "message_reactions: delete own"
  on public.message_reactions for delete
  using (auth.uid() = user_id);

-- 4i. enable realtime replication
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.message_reactions;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.message_reads;
exception when others then null; end $$;

-- =====================================================================
-- ---------------------------------------------------------------------
-- 5. CHAT phase 2 — voice duration metadata
--    so the player can show "0:08" before the user taps play
-- ---------------------------------------------------------------------
alter table public.messages
  add column if not exists duration_ms integer;

-- =====================================================================
-- 6. CHAT phase 3 — image messages storage RLS
--    mirrors migration 20260527000001_chat_phase3.sql
--    bucket itself must be created in the dashboard first
--    path convention: ${user_id}/chat-${timestamp}.jpg
--
--    no schema changes needed:
--      - pagination uses messages_family_created_idx (family_id, created_at desc)
--      - read receipts reuse message_reads.last_read_at from phase 1
--      - typing indicators use realtime broadcast (no DB rows)
-- =====================================================================

drop policy if exists "chat-images: users can read own" on storage.objects;
create policy "chat-images: users can read own"
  on storage.objects for select
  using (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "chat-images: users can insert own" on storage.objects;
create policy "chat-images: users can insert own"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "chat-images: users can update own" on storage.objects;
create policy "chat-images: users can update own"
  on storage.objects for update
  using (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "chat-images: users can delete own" on storage.objects;
create policy "chat-images: users can delete own"
  on storage.objects for delete
  using (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- 7. CHAT phase 3.5 — pin, mentions, search
--    mirrors migration 20260527000002_chat_phase3_5.sql
--    safe to re-run (idempotent)
-- =====================================================================

-- 7a. messages.pinned_at — null means unpinned
alter table public.messages
  add column if not exists pinned_at timestamptz;

-- 7b. message_mentions — composite PK, family-scoped via parent message
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

-- 7c. FTS on messages.body — 'simple' config (no stemming)
alter table public.messages
  add column if not exists body_tsv tsvector
  generated always as (to_tsvector('simple', coalesce(body, ''))) stored;

create index if not exists messages_body_tsv_idx
  on public.messages using gin (body_tsv);

-- ---------------------------------------------------------------------
-- 8. LETTERS — Whisper transcript columns
--    mirrors migration 20260527000003_letter_transcripts.sql
-- ---------------------------------------------------------------------
alter table public.letters add column if not exists transcript text;
alter table public.letters add column if not exists transcript_status text;
alter table public.letters add column if not exists transcript_error text;

-- =====================================================================
-- NOT covered by this file (configure in the supabase dashboard UI):
--   - creating the `voice-memos` storage bucket itself
--   - creating the `chat-images` storage bucket itself
--   - auth redirect URLs and the email confirmation toggle
--   - the `message-sent-fanout` Database Webhook — see supabase/CHAT_WEBHOOK.md
--   - the `letter-audio-uploaded` Database Webhook — see supabase/TRANSCRIBE_WEBHOOK.md
-- =====================================================================
