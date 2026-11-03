# Feature 3: Manage pantry items

## 2026-11-03

Feature 3: manage pantry items. Follow CLAUDE.md.
- /pantry lists my items (name, category, quantity and unit, expiry
  date), soonest expiring first.
- "Add item" form: name, category (pick one or create one), quantity,
  unit, price, purchased on, expires on, in stock.
- /pantry/[id] detail page, an edit page reusing the form, and delete
  with an "Are you sure?" confirmation.
Done when: I can add, view, edit and delete an item, and delete asks first.

### Summary
/pantry now lists the user's items (name, category, quantity + unit, expiry), soonest expiring first with no-expiry items last. Added /pantry/new and /pantry/[id]/edit sharing one form (category: pick one or "+ New category", which reuses a same-named category instead of duplicating), a /pantry/[id] detail page, and an inline "Are you sure?" box before delete. All data goes through the logged-in user's Supabase session, so RLS limits it to their own rows; a basic "fill in name, category and quantity" message is in place and feature 4 will add the detailed validation.
Widened the page from max-w-md to max-w-2xl for the list and kept the login/sign-up cards at their old width. Did not create a test account (no fake data in the real database), so add/edit/delete was not clicked through by me; types, lint, build and logged-out redirects were checked.
