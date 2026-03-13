<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SocialVibe Frontend

This frontend now depends on the local `backend` service for activities, profile, and favorites.
Authentication is handled by Supabase Auth (email/password).

## Run Locally

Prerequisites:

- Node.js
- Local Supabase stack running (`supabase-project`)
- Backend server running on `http://127.0.0.1:4000`

1. Install dependencies:
   `npm install`
2. Configure env vars (copy `.env.example` to `.env.local`):
   - `VITE_API_PROXY_TARGET` (default `http://127.0.0.1:4000`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Start dev server:
   `npm run dev`
4. Open:
   `http://127.0.0.1:3000`

Vite proxy forwards `/api/*` to `http://127.0.0.1:4000` by default.
You can override with `VITE_API_PROXY_TARGET`.
