create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text not null,
  bio text,
  email text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  location text not null,
  start_time timestamptz not null,
  category text not null,
  description text,
  host_profile_id uuid not null references public.profiles (id),
  participant_count int not null default 1,
  max_participants int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_max_participants_chk check (max_participants >= 1),
  constraint activities_participant_count_chk check (
    participant_count >= 0 and participant_count <= max_participants
  )
);

create table if not exists public.favorites (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, activity_id)
);

create index if not exists idx_activities_start_time
  on public.activities (start_time desc);

create index if not exists idx_activities_category
  on public.activities (category);

create index if not exists idx_favorites_profile_id
  on public.favorites (profile_id);
