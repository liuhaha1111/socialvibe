alter table public.profiles
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_updated_at timestamptz;

alter table public.activities
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_latitude_range_chk'
  ) then
    alter table public.profiles
      add constraint profiles_latitude_range_chk check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_longitude_range_chk'
  ) then
    alter table public.profiles
      add constraint profiles_longitude_range_chk check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_lat_lng_pair_chk'
  ) then
    alter table public.profiles
      add constraint profiles_lat_lng_pair_chk check (
        (latitude is null and longitude is null) or
        (latitude is not null and longitude is not null)
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_latitude_range_chk'
  ) then
    alter table public.activities
      add constraint activities_latitude_range_chk check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_longitude_range_chk'
  ) then
    alter table public.activities
      add constraint activities_longitude_range_chk check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_lat_lng_pair_chk'
  ) then
    alter table public.activities
      add constraint activities_lat_lng_pair_chk check (
        (latitude is null and longitude is null) or
        (latitude is not null and longitude is not null)
      );
  end if;
end $$;

create index if not exists idx_activities_lat_lng
  on public.activities (latitude, longitude);
