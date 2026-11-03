# Feature 5: Stars (staples)

## 2026-11-03

Feature 5: stars. Follow CLAUDE.md.
A star toggle on each item in the list and on its detail page; starring
inserts a row in stars, unstarring deletes it. A "Staples" page showing
only my starred items, with out-of-stock ones highlighted.
Done when: I star two items and see exactly those two on Staples.

### Summary
Added a ☆/★ toggle (`StarButton`) on every row of /pantry and on the item page: starring inserts a row in `stars`, unstarring deletes it, and the star flips instantly then saves (reverting if the save fails). Added /pantry/staples, which loads only starred items through an inner join on `stars`, lists out-of-stock staples first with an amber "Out of stock" highlight, and says how many need restocking; Pantry and Staples links are now in the header. Pulled the item rows into a shared `ItemList` so both pages use the same list.
No migration needed (the `stars` table and its RLS came with feature 2). Types, lint, build and the logged-out redirect were checked; I did not click through starring while logged in.
