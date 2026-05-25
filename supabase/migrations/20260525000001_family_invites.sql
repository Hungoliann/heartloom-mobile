create table if not exists public.family_invites (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  invite_code text not null unique,
  created_by uuid references auth.users(id) on delete cascade not null,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now() not null
);

-- Only the family owner and the invited user need to see invites
alter table public.family_invites enable row level security;

create policy "family members can create invites"
  on public.family_invites for insert
  with check (auth.uid() = created_by);

create policy "anyone authenticated can read invite by code"
  on public.family_invites for select
  using (auth.role() = 'authenticated');

create policy "only redeemer can update used_by"
  on public.family_invites for update
  using (auth.uid() = used_by or used_by is null);
