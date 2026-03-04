insert into public.profiles (id, name, avatar_url, bio, email, location)
values (
  '11111111-1111-1111-1111-111111111111',
  'Test User',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'MVP test profile',
  'test@example.com',
  'Shanghai'
)
on conflict (id) do update
set
  name = excluded.name,
  avatar_url = excluded.avatar_url,
  bio = excluded.bio,
  email = excluded.email,
  location = excluded.location,
  updated_at = now();

insert into public.activities (
  id,
  title,
  image_url,
  location,
  start_time,
  category,
  description,
  host_profile_id,
  participant_count,
  max_participants
)
values
  (
    '22222222-2222-2222-2222-222222222221',
    'City Sunset Walk',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200',
    'The Bund',
    now() + interval '2 day',
    'City Walk',
    'A relaxed group walk before sunset.',
    '11111111-1111-1111-1111-111111111111',
    1,
    8
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Cafe Sketch Meetup',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
    'Jingan',
    now() + interval '3 day',
    'Workshop',
    'Bring your sketchbook and chat.',
    '11111111-1111-1111-1111-111111111111',
    2,
    10
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    'Board Game Night',
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=1200',
    'Xuhui',
    now() + interval '4 day',
    'Board Game',
    'Casual board game evening.',
    '11111111-1111-1111-1111-111111111111',
    3,
    12
  )
on conflict (id) do update
set
  title = excluded.title,
  image_url = excluded.image_url,
  location = excluded.location,
  start_time = excluded.start_time,
  category = excluded.category,
  description = excluded.description,
  host_profile_id = excluded.host_profile_id,
  participant_count = excluded.participant_count,
  max_participants = excluded.max_participants,
  updated_at = now();
