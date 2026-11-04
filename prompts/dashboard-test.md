# Feature 11b: Dashboard stat test

## 2026-11-03

New PR: dashboard stat test. Follow CLAUDE.md.
Vitest unit test for "spent this month" in lib/stats.ts, with a fixed
today's date: three items bought this month for $4, $6 and $10 (one of
them on the 1st of the month) and one bought last month for $5, so the
result is $20.
Red/green: temporarily (uncommitted) change the month filter so it
excludes the 1st, run the test for my failing screenshot, revert, run
again for my passing one. Same three PR headings as the isolation test.

### Summary
Added `tests/dashboard-stats.test.ts`: `spentThisMonth` with a fixed today (2026-11-17) and $4 on Nov 1, $6 on Nov 9, $10 on Nov 17 and $5 on Oct 31 must return $20. The boundary dates (the 1st, today, and the last day of last month) are deliberate. Added the `@/` import alias to `vitest.config.mts` so tests import code the same way the app does.
Red/green: temporarily (uncommitted) made the month filter skip the 1st; the test failed with 16 instead of 20. Reverted with `git checkout`, and it passed. `npm test` now runs both tests (data isolation and this one).
