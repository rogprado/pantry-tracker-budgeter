# Pantry: context and rules for Claude Code

## What we're building
Pantry is my solo web app for an MBA class at Haas (Solo Demo Day). It keeps an inventory of
everything in my kitchen, uses Claude to suggest recipes from what I have, builds a shopping list
of versatile ingredients within my budget, and tracks my grocery spending. PLAN.md has the full
plan and the database design; read it before any feature.

## Deadline and scope
- Submission is Wed Nov 4 before class. Everything gets built on Tue Nov 3.
- Keep each feature minimal and working. No polish unless I ask.
- Build order:
  1. Sign up and login
  2. Data model
  3. Create / read / update / delete pantry items
  4. Validation
  5. Stars (staples)
  6. Search, filter and sort
  7. Dashboard (1 chart + 3 stats)
  8. What can I cook? (custom feature A)
  9. Smart shopping list (custom feature B)
  10. Budget tracker (custom feature C)
  11. Tests: data isolation, and one dashboard stat

## Grading requirements to respect
- Every account is a row in a public `users` table. Each user sees only their own data.
- Deleting asks "Are you sure?" first.
- Required fields show friendly messages, not browser errors, and nothing blank saves.
- All stars live in one `stars` junction table (user_id, item_id).
- The dashboard has at least one chart and 2-3 stats computed from real data.
- Never seed fake data into the real database. I enter real items myself.

## Workflow for every feature
1. Never commit to main; it is protected.
2. Before building: create a GitHub issue with `gh issue create`, using the user story from
   PLAN.md. Then `git checkout main && git pull` and create a branch named
   `feature/<short-name>`.
3. Append my prompt, word for word, to `prompts/<short-name>.md` under a dated heading. When
   done, append a 3-5 line summary of what you did, including anything you got wrong and fixed.
4. One feature per PR. Push and open the PR with `gh pr create`. The description says what
   changed, how to test it, and "Closes #<issue>".
5. Do not merge. I test the Vercel preview and merge myself.

## Tech
- Next.js (App Router, TypeScript), Tailwind, Supabase (auth, Postgres), hosted on Vercel.
- Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY, ANTHROPIC_API_KEY. Use Supabase's new publishable (sb_publishable_) and
  secret (sb_secret_) keys, not the legacy anon/service_role keys.
- Every table has row-level security: users read and write only their own rows.
- Schema changes go in `supabase/migrations/` as SQL files. Tell me when I need to run one in
  the Supabase SQL Editor.
- Claude API calls only in server code. Model: claude-sonnet-5-5. Ask Claude for JSON and
  validate it before showing or saving it.
- Secrets only in `.env.local` (gitignored) and Vercel. Keep `.env.example` listing variable
  names, never values. This repo is public.

## Working with me
- For the data model and the two Claude features, show a short plan first and wait for my OK.
  For smaller features, build directly.
- After each feature, explain in 3 plain sentences how it works, so I can answer questions about
  it at the demo.
- Plain, calm UI. Friendly error messages.
