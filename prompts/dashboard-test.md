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
