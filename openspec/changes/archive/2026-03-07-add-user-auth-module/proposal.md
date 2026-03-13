## Why

The current MVP uses a single fixed test profile and has no real authentication flow. Adding user registration and login is necessary to support real user identity, data isolation, and secure access to user-specific features.

## What Changes

- Add email/password registration and login flows for end users.
- Add authenticated session handling (sign in, refresh, sign out) in the frontend.
- Add backend authentication middleware to validate bearer tokens and resolve the current user.
- Update user-scoped APIs (`/me/profile`, `/me/favorites`, activity creation ownership) to use authenticated identity instead of a fixed profile.
- Create or update profile bootstrap logic so a new account can initialize profile data on first login.
- Add validation and error responses for auth failures (invalid credentials, missing token, expired token).
- **BREAKING**: Protected APIs now require valid `Authorization: Bearer <token>` headers where previously a fixed test profile was assumed.

## Capabilities

### New Capabilities
- `user-auth`: User registration, login, logout, session lifecycle, and authenticated identity propagation to backend APIs.

### Modified Capabilities
- None.

## Impact

- Frontend: route guards, auth UI/pages, auth state management, and API client token injection.
- Backend: auth middleware, request context identity resolution, and authorization checks for user-scoped operations.
- Database/Supabase: integration with Supabase Auth users and profile bootstrap/association flow.
- API contracts: protected endpoints require bearer token and return auth-specific error codes/messages.
- Testing: add auth flow tests and regressions for user-scoped endpoints under authenticated/unauthenticated states.
