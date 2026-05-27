-- =====================================================================
-- chat phase 1 — extend messages, add read receipts + reactions, RLS
-- safe to re-run (idempotent)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. extend public.messages
-- ---------------------------------------------------------------------
alter table public.messages add column if not exists media_url text;
alter table public.messages add column if not exists media_type text;
alter table public.messages add column if not exists shared_letter_id uuid references public.letters(id) on delete set null;
alter table public.messages add column if not exists reply_to_id uuid references public.messages(id) on delete set null;
alter table public.messages add column if not exists edited_at timestamptz;
alter table public.messages add column if not exists deleted_at timestamptz;

-- drop any existing check constraint on messages.message_type so we can
-- transition to the new media_type column without enum collisions
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

-- ---------------------------------------------------------------------
-- 2. index for family-scoped chat history fetches
-- ---------------------------------------------------------------------
create index if not exists messages_family_created_idx
  on public.messages (family_id, created_at desc);

-- ---------------------------------------------------------------------
-- 3. helper: my_family_id()
--    RLS policies cannot subquery profiles cheaply on every row, so we
--    expose a security definer function that returns the caller's
--    family_id. it bypasses RLS internally but only reads the caller's
--    own profile row keyed by auth.uid().
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 4. message_reads — per-user last-read marker per family
-- ---------------------------------------------------------------------
create table if not exists public.message_reads (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz default now() not null,
  primary key (family_id, user_id)
);

alter table public.message_reads enable row level security;

-- ---------------------------------------------------------------------
-- 5. message_reactions — emoji reactions on messages
-- ---------------------------------------------------------------------
create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now() not null,
  primary key (message_id, user_id, emoji)
);

alter table public.message_reactions enable row level security;

-- ---------------------------------------------------------------------
-- 6. RLS policies
-- ---------------------------------------------------------------------

-- messages: replace any prior policies with family-scoped ones
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
  with check (
    auth.uid() = author_id
    and family_id = public.my_family_id()
  );

-- update is used for soft delete (deleted_at) and edits (edited_at)
create policy "messages: update own"
  on public.messages for update
  using (auth.uid() = author_id and family_id = public.my_family_id())
  with check (auth.uid() = author_id and family_id = public.my_family_id());

create policy "messages: delete own"
  on public.messages for delete
  using (auth.uid() = author_id and family_id = public.my_family_id());

-- message_reads
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

-- message_reactions
drop policy if exists "message_reactions: read in family"   on public.message_reactions;
drop policy if exists "message_reactions: insert own"       on public.message_reactions;
drop policy if exists "message_reactions: delete own"       on public.message_reactions;

create policy "message_reactions: read in family"
  on public.message_reactions for select
  using (
    exists (
      select 1
      from public.messages m
      where m.id = message_reactions.message_id
        and m.family_id = public.my_family_id()
    )
  );

create policy "message_reactions: insert own"
  on public.message_reactions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.messages m
      where m.id = message_reactions.message_id
        and m.family_id = public.my_family_id()
    )
  );

create policy "message_reactions: delete own"
  on public.message_reactions for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 7. realtime replication for messages
--    wrapped in exception block — re-adding to the publication errors,
-- ---------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when others then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.message_reactions;
exception when others then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.message_reads;
exception when others then
  null;
end $$;
