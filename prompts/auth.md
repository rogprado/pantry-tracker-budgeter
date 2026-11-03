# Feature 1: Sign up and login

## 2026-11-03

Feature 1 from PLAN.md: sign up and login. Follow CLAUDE.md.
- Set up Next.js (TypeScript, Tailwind, App Router) with Supabase
  email/password auth.
- Pages: /signup, /login, and a protected /pantry page that sends
  logged-out visitors to /login. A log out button in the header.
- On sign up, a database trigger adds a row to a public users table (id,
  email, monthly_budget empty, created_at), with RLS so a user can only
  read their own row.
- Create .env.example.
Done when: I can sign up, see an empty /pantry page, log out and log back in.

### Summary
Set up Next.js 16 (App Router, TypeScript, Tailwind) with Supabase email/password auth: /signup, /login, a protected /pantry page, a header log out button, and a `proxy.ts` that refreshes the session and redirects logged-out visitors to /login. Added `supabase/migrations/20261103000000_create_users.sql`: a `public.users` table filled by a sign-up trigger, with RLS so each user reads only their own row (id is `uuid` to match Supabase Auth ids).
Got wrong and fixed: the scaffolded `.gitignore` ignored `.env*`, which would have hidden `.env.example`, so I added an exception; the first production build failed because this Next.js version prerenders pages and the header reads cookies, so I wrapped the header and pages in `<Suspense>`.
