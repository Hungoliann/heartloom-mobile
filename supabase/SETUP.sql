-- =====================================================================
-- heartloom-mobile — one-shot supabase setup
-- project ref: kttzkpxbqnhmbovalwfs
--
-- run this AFTER creating the `voice-memos` storage bucket:
--   storage -> new bucket -> name=voice-memos, public=OFF
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
-- NOT covered by this file (configure in the supabase dashboard UI):
--   - creating the `voice-memos` storage bucket itself
--   - auth redirect URLs and the email confirmation toggle
-- =====================================================================
