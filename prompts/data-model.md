# Feature 2: Data model

## 2026-11-03

Feature 2: data model. Follow CLAUDE.md. Show me your plan first.
One migration creating categories, pantry_items, recipes and stars exactly
as in PLAN.md section 3. Foreign keys with on delete cascade, RLS on every
table so users only touch their own rows, and stars keyed on the pair
(user_id, item_id). No UI changes.
Done when: the migration runs and all five tables show RLS enabled.

ok

### Summary
Added `supabase/migrations/20261103010000_create_data_model.sql`: categories, pantry_items, recipes and stars as in PLAN.md, with `uuid` user ids (matching `users.id`), `on delete cascade` on every foreign key, and `user_id` defaulting to the logged-in user. RLS is on for all four new tables with select/insert/update/delete policies for own rows; inserts and updates also check that an item's category and a star's item belong to the same user. Stars has no update policy because a star is only ever added or removed.
Could not run the SQL locally (no Postgres on this machine), so it was checked by reading only; the user runs it in the Supabase SQL Editor.
