alter table public.profiles
  add column if not exists auth_user_id uuid;

create unique index if not exists idx_profiles_auth_user_id
  on public.profiles (auth_user_id)
  where auth_user_id is not null;
