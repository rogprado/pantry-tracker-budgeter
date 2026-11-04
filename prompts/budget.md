# Feature 10: Budget tracker

## 2026-11-03

Feature 10: budget tracker. Follow CLAUDE.md.
A settings page to set my monthly grocery budget (users.monthly_budget).
On the dashboard and the shopping page, show spent versus budget as a
progress bar: amber at 80%, red over 100%, with a friendly warning.
Done when: changing the budget updates the bar.

### Summary
Added /settings with a budget form (blank = no budget; must be a positive amount up to $100,000; friendly messages, keeps what I typed) that saves `users.monthly_budget`, and a `BudgetBar` on the dashboard, shopping page and settings: this month's spending against the budget, purple below 80%, amber with a heads-up from 80%, red with the amount over above 100%, or a "Set a budget" prompt when none is set. The migration `20261103030000_users_update_budget.sql` adds an update policy for your own row, limits app updates to the `monthly_budget` column, and requires a positive budget. Budget maths is pure in `lib/budget.ts`; spending reuses `spentThisMonth`, so the dashboard, shopping list and bar agree. Header now has a Settings link in place of the email.
Checked the rules on sample numbers and screenshotted the four bar states with sample data in headless Chrome (temporary page deleted). Fixed: the percent was rounded up, so $239.99 of $300 said "80%" in the purple "ok" color; it now rounds down. Not clicked through logged in.
