# Feature 9: Smart shopping list

## 2026-11-03

Feature 9: smart shopping list. Follow CLAUDE.md. Show me your plan first.
- /shopping shows two parts: (1) my starred staples that are out of stock,
  (2) up to 5 versatile ingredients Claude suggests that would unlock the
  most new recipes with what I already have, each with a one-line reason
  and an estimated price.
- If I've set a monthly budget, show the estimated total against what's
  left of it and drop the lowest-priority suggestions if it goes over.
- Keep the instructions in lib/prompts/shopping.ts.
Done when: both parts show and the list respects my budget.

go ahhead

### Summary
Added /shopping with (1) my out-of-stock staples, priced at the last price I entered, shown straight away, and (2) a "Suggest ingredients" button that calls `app/api/shopping/suggest/route.ts`: in-stock items, restock staples and category names go to `claude-sonnet-5-5` (structured outputs + refusal fallback) with the instructions in `lib/prompts/shopping.ts`, and the reply is checked in `lib/shopping.ts` (max 5, ranked, one-line reason, price $0-100, nothing already in stock or being restocked). If `users.monthly_budget` is set, the page shows the estimated total against budget minus this month's spending; `fitToBudget` keeps staples and drops suggestions from the least useful up until it fits, listing them as "Left out to stay on budget". Moved the shared Claude error handling into `lib/claude.ts` and pointed the recipes route at it.
Got wrong and fixed before committing: I first excluded every pantry item from suggestions, which would hide out-of-stock non-staples you actually need; now only in-stock items and restock staples are excluded. Checked fitToBudget on sample numbers and made one real call on a made-up pantry (5 sensible suggestions in 4.8 s, about 1 cent). Not clicked through logged in. No way to set a budget in the app until feature 10.
