# Feature 6: Search, filter and sort

## 2026-11-03

Feature 6: search, filter and sort. Follow CLAUDE.md.
On /pantry: search by name, filter by category and by in stock or out of
stock, sort by expiry date, newest or price. Keep the choices in the URL.
Done when: all three work together.

### Summary
Added a filter bar on /pantry: search by name, category, in/out of stock, and sort by expiry (default), newest or price (low to high; no expiry/price last). It is a plain GET form, so every choice lives in the URL (?q=&category=&stock=&sort=); dropdowns apply on change and search on Enter. The database does the filtering and sorting (RLS still limits it to my items), unknown URL values are ignored, and an empty result shows "No items match" with a Clear all link.
Got wrong and fixed: the first build failed because the browser-side filter bar imported `lib/pantry.ts`, which uses server-only code; I moved the filter options and URL parsing into `lib/filters.ts`. Checked URL parsing on sample inputs; types, lint and build pass. Not clicked through logged in.

## 2026-11-03 (follow-up 2)

every time I search and click clear all, it created a duplicate of the search bar (tested until three appeared). Can  you revert the change?

### Summary
Reverted the no-reload change with `git revert`, so the app code is back to the plain form that reloads the page; the follow-up stays in history. What I got wrong: the `<Form>` + keyed `<Suspense>` change duplicated the filter bar each time "Clear all" was clicked after a search, and I pushed it without trying it in a logged-in browser.
