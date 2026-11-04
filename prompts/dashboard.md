# Feature 7: Dashboard

## 2026-11-03

Feature 7: dashboard. Follow CLAUDE.md.
/dashboard with three stats: spent this month (sum of prices of items
purchased this month), items in stock, items expiring in the next 7 days.
Plus a Recharts bar chart of this month's spending by category.
Put every calculation in pure functions in lib/stats.ts that take today's
date as an input, so they can be tested.
Done when: the numbers match my real data.

### Summary
Added /dashboard with three stat cards (spent this month, items in stock, in-stock items expiring from today through the next 7 days) and a Recharts horizontal bar chart of this month's spending by category, biggest first, with the amount at each bar's tip and a hover tooltip. Every calculation is a pure function in `lib/stats.ts` that takes today as a "YYYY-MM-DD" string; the page works out today in Berkeley time (America/Los_Angeles) so the month doesn't flip early on the UTC server. Added a Dashboard link in the header and protected /dashboard for logged-out visitors.
Checked the functions with a throwaway script, including the PLAN.md test ($4+$6+$10 this month, $5 last month = $20), month/year rollover and the time zone at night; types, lint and build pass. I couldn't see the chart rendered because that needs a logged-in session.

## 2026-11-03 (follow-up)

Can you create a dashboard showing spend per day or week as well below categories?

### Summary
Added a "Spending over time" column chart below the category chart, with a By day / By week toggle: by day shows every day of this month (the days add up to the "Spent" card), by week shows the last 8 Monday-to-Sunday weeks. Both series are pure functions in `lib/stats.ts` (`spendingByDay`, `spendingByWeek`, `weekStart`) computed on the server; the toggle only switches which one is drawn in the browser, so there is no navigation or reload (avoiding the kind of change I had to revert in feature 6). Checked with a throwaway script (daily sum = $20 for the PLAN.md data, week boundaries on Sunday/Monday, leap February); types, lint and build pass. Not seen rendered while logged in.
