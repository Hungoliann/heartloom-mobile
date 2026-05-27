-- =====================================================================
-- chat phase 3 — image messages storage RLS
--
-- prereq: create the `chat-images` storage bucket in the supabase
-- dashboard first (storage -> new bucket -> name=chat-images, public=OFF).
--
-- path convention: ${user_id}/chat-${timestamp}.jpg
-- each user can only touch objects under their own ${auth.uid()}/ prefix.
--
-- no schema changes are needed for phase 3:
--   - pagination uses the existing messages_family_created_idx
--     on (family_id, created_at desc) which already covers the
--     WHERE family_id = ? order by created_at desc, id desc clauses
--   - read receipts reuse message_reads.last_read_at from phase 1
--   - typing indicators use realtime broadcast (no DB rows)
--
-- safe to re-run (idempotent).
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
