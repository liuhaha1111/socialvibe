create table if not exists public.activity_members (
  activity_id uuid not null references public.activities (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (activity_id, profile_id)
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles (id) on delete cascade,
  to_profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friend_requests_status_chk check (status in ('pending', 'accepted', 'rejected')),
  constraint friend_requests_no_self_chk check (from_profile_id <> to_profile_id)
);

create unique index if not exists idx_friend_requests_unique_pending
  on public.friend_requests (from_profile_id, to_profile_id)
  where status = 'pending';

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  profile_low uuid not null references public.profiles (id) on delete cascade,
  profile_high uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_order_chk check (profile_low < profile_high)
);

create unique index if not exists idx_friendships_unique_pair
  on public.friendships (profile_low, profile_high);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  activity_id uuid references public.activities (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint conversations_type_chk check (type in ('direct', 'activity_group')),
  constraint conversations_activity_guard_chk check (
    (type = 'direct' and activity_id is null) or
    (type = 'activity_group' and activity_id is not null)
  )
);

create unique index if not exists idx_conversations_activity_group
  on public.conversations (activity_id)
  where type = 'activity_group';

create table if not exists public.direct_conversation_pairs (
  profile_low uuid not null references public.profiles (id) on delete cascade,
  profile_high uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid not null unique references public.conversations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_low, profile_high),
  constraint direct_conversation_pairs_order_chk check (profile_low < profile_high)
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id),
  constraint conversation_members_role_chk check (role in ('owner', 'member'))
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_profile_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  message_type text not null default 'text',
  created_at timestamptz not null default now(),
  constraint messages_type_chk check (message_type in ('text')),
  constraint messages_content_len_chk check (char_length(content) > 0 and char_length(content) <= 2000)
);

create index if not exists idx_messages_conversation_created_at
  on public.messages (conversation_id, created_at asc);
