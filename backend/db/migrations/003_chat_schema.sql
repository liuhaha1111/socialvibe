create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_participants (
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_profile_id uuid references public.profiles(id),
  content text not null,
  message_type text not null default 'text' check (message_type in ('text', 'system')),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_read_states (
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_message_id uuid references public.chat_messages(id),
  updated_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create index if not exists idx_chat_messages_conversation_created_at
  on public.chat_messages(conversation_id, created_at desc);

create index if not exists idx_chat_participants_profile_id
  on public.chat_participants(profile_id);

create index if not exists idx_chat_read_states_profile_id
  on public.chat_read_states(profile_id);
