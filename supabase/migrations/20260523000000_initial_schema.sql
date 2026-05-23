-- Profiles (auto-created for every auth user via trigger)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  family_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Families
create table if not exists public.families (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references auth.users not null,
  created_at timestamptz default now() not null
);

-- Letters (future letters)
create table if not exists public.letters (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references auth.users not null,
  family_id uuid references public.families,
  title text not null,
  body text,
  media_url text,
  media_type text check (media_type in ('text', 'audio', 'video')),
  recipient_name text,
  deliver_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Documents (vault: will, DNR, etc.)
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users not null,
  family_id uuid references public.families,
  title text not null,
  category text check (category in ('will', 'dnr', 'funeral_plan', 'financial', 'other')),
  file_url text not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger letters_updated_at before update on public.letters
  for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.profiles  enable row level security;
alter table public.families  enable row level security;
alter table public.letters   enable row level security;
alter table public.documents enable row level security;

-- Policies
create policy "users: own profile"   on public.profiles  for all using (auth.uid() = id);
create policy "users: own family"    on public.families  for all using (auth.uid() = owner_id);
create policy "users: own letters"   on public.letters   for all using (auth.uid() = author_id);
create policy "users: own documents" on public.documents for all using (auth.uid() = owner_id);
