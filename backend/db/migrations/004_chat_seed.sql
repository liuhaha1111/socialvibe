insert into public.profiles (id, name, avatar_url, bio, email, location)
values
  (
    '11111111-1111-1111-1111-111111111112',
    'Sarah',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    'Likes city walks and coffee chats',
    'sarah@example.com',
    'Shanghai'
  ),
  (
    '11111111-1111-1111-1111-111111111113',
    'Jason',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    'Board games and weekend events',
    'jason@example.com',
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

insert into public.chat_conversations (id, type)
values
  ('33333333-3333-3333-3333-333333333331', 'direct'),
  ('33333333-3333-3333-3333-333333333332', 'direct'),
  ('33333333-3333-3333-3333-333333333333', 'system')
on conflict (id) do update
set
  type = excluded.type,
  updated_at = now();

insert into public.chat_participants (conversation_id, profile_id)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111112'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111113'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111')
on conflict (conversation_id, profile_id) do nothing;

insert into public.chat_messages (id, conversation_id, sender_profile_id, content, message_type, created_at)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111112',
    '周末一起参加活动吗？',
    'text',
    now() - interval '5 minute'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '可以，我已经报名了。',
    'text',
    now() - interval '3 minute'
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111113',
    '今晚桌游局还缺人吗？',
    'text',
    now() - interval '2 minute'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    null,
    '你的活动已审核通过。',
    'system',
    now() - interval '1 minute'
  )
on conflict (id) do update
set
  content = excluded.content,
  created_at = excluded.created_at;

insert into public.chat_read_states (conversation_id, profile_id, last_read_message_id, updated_at)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444442',
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111112',
    '44444444-4444-4444-4444-444444444441',
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    null,
    now() - interval '10 minute'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111113',
    '44444444-4444-4444-4444-444444444443',
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    null,
    now() - interval '10 minute'
  )
on conflict (conversation_id, profile_id) do update
set
  last_read_message_id = excluded.last_read_message_id,
  updated_at = excluded.updated_at;
