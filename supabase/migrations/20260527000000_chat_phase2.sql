-- Phase 2 chat: store voice message duration on upload so the player can
-- show the length without forcing the user to tap play first.
alter table public.messages
  add column if not exists duration_ms integer;
