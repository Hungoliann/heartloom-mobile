-- Whisper-generated transcript columns for letters with audio
alter table public.letters add column if not exists transcript text;
alter table public.letters add column if not exists transcript_status text;
alter table public.letters add column if not exists transcript_error text;
