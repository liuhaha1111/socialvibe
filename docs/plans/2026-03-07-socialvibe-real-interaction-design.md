# SocialVibe Real Interaction Design

- Date: 2026-03-07
- Scope: Fix current UX/data issues and replace static social/chat flows with real authenticated data.

## 1. Goals

1. Fix favorites visibility after toggling from detail/home.
2. Fix garbled text (encoding/content) in create/chat/profile/saved/home/detail pages.
3. Fix profile settings save failures.
4. Remove static social/chat data and implement real friend graph + realtime chat.
5. Support both direct chat and activity-based group chat.

## 2. Confirmed Product Decisions

1. Friend model: request -> accept/reject -> chat allowed only after acceptance.
2. Chat mode: realtime.
3. Group mode: activity auto-group only (no manual group creation in this scope).
4. UI language: Simplified Chinese.

## 3. Current Root Causes

1. Favorites issue:
- `frontend/pages/Detail.tsx` still uses static fallback ID (`mock-trending-1`).
- Static cards and synthetic IDs do not map to backend persisted activity rows.

2. Garbled create/profile/chat text:
- Multiple files contain mojibake-like content and mixed encoding artifacts.

3. Settings save issue:
- Profile update currently sends empty email strings, while backend validates `email` as strict email when present.

4. Static social/chat data:
- `frontend/pages/ChatList.tsx` and `frontend/pages/Chat.tsx` are static.
- No backend friend/conversation/message APIs exist yet.

## 4. Architecture

## 4.1 Backend (BFF + Supabase)

- Keep Express BFF style.
- Add new domain modules:
  - friend requests / friendships
  - conversations / conversation members
  - messages
- Use authenticated user identity (`req.auth`) for all social/chat operations.

## 4.2 Data Storage (Supabase/Postgres)

Add migration to create:
- `friend_requests`
- `friendships`
- `conversations`
- `conversation_members`
- `messages`

Use `profiles.id` as app-level user reference (already mapped from auth user via `auth_user_id`).

## 4.3 Frontend

- Remove static chat/mock cards.
- Add API-backed friend request and chat pages.
- Use Supabase Realtime subscriptions for incoming message updates.
- Ensure favorites/settings/create/profile/detail/home all consume persisted API data only.

## 5. Data Flow

1. Friend request:
- A sends request to B.
- B accepts/rejects.
- On accept, friendship row is created (normalized pair).

2. Direct conversation:
- Only available if friendship exists.
- Create-or-get direct conversation row.
- Members inserted into `conversation_members`.

3. Activity group conversation:
- For each activity, create-or-get one `activity_group` conversation.
- Host and participants are members.

4. Realtime:
- Chat page subscribes to `messages` by `conversation_id`.
- Chat list refreshes last message/unread summary on new message events.

## 6. API Additions

- Friends:
  - `POST /api/v1/friends/requests/:targetProfileId`
  - `GET /api/v1/friends/requests`
  - `POST /api/v1/friends/requests/:id/accept`
  - `POST /api/v1/friends/requests/:id/reject`
  - `GET /api/v1/friends`

- Chat:
  - `GET /api/v1/chat/conversations`
  - `POST /api/v1/chat/conversations/direct/:friendProfileId`
  - `GET /api/v1/chat/conversations/:id/messages`
  - `POST /api/v1/chat/conversations/:id/messages`

## 7. Error Handling

Use existing envelope and status mapping:
- `401 UNAUTHORIZED`
- `403 FORBIDDEN` for non-friend/non-member access
- `404 NOT_FOUND`
- `409 CONFLICT` for duplicate request/conversation constraints

## 8. Testing Strategy

1. Backend API tests:
- Friend request lifecycle.
- Direct-chat authorization (must be friends).
- Conversation membership checks.
- Message create/read with access control.

2. Frontend tests:
- Favorites persistence visibility in saved page.
- Settings save with empty/valid email behavior.
- Create page text rendering and submit.
- Chat guard + list/message realtime state handling (with mocked stream).

3. Regression:
- Build backend/frontend.
- Run all existing frontend tests plus new tests.
- Run targeted backend social/chat/favorites/profile tests.

## 9. Out of Scope

- Manual group creation and group admin roles.
- Advanced unread counters across devices.
- Media/file attachments in chat.
