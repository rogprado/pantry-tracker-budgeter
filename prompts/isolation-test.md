# Feature 11a: Data isolation test

## 2026-11-03

New PR: data isolation test. Follow CLAUDE.md (issue, branch, PR).
Write a Vitest test: given User A has a pantry item and User B has none,
when B (signed in as B) lists pantry items and asks for A's item by id,
then B gets an empty list and no row. Create both throwaway users with the
admin API and delete them afterwards. Add an "npm test" script.
Red/green: give me SQL to temporarily add a pantry_items select policy
using (true). I'll run it, you run the test for my failing screenshot, then
give me SQL to drop that policy, and run the test again for my passing one.
Draft the PR description with three headings: "What this test checks",
"Red, then green" (I'll add screenshots) and "What would break it".

### Summary
Added Vitest (`npm test` → `vitest run`, config in `vitest.config.mts` loading `.env.local`) and `tests/data-isolation.test.ts`: two throwaway users are created with the admin API, A adds a category and an item while signed in as A (with a sanity check that A can see it), then B, signed in with the publishable key, lists `pantry_items` and asks for A's item by id; both must come back empty. The users are deleted in `afterAll`, which cascades to their rows. Queries select only `id`, so failures never print item names.
Red/green done: with a temporary `using (true)` select policy both tests failed (B saw 14 rows including A's item 17); after dropping it both passed. Checked after each run that only the real account remains. Had to bump `@types/node` to ^24 because Vitest 5 requires it, and renamed the config to `.mts` to silence a Vite warning.
