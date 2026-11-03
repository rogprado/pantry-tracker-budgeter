# Feature 4: Validation

## 2026-11-03

Feature 4: validation. Follow CLAUDE.md.
Name, category and quantity are required; quantity and price can't be
negative. Show friendly messages under each field, keep what I typed, and
check on the server too.
Done when: submitting an empty form shows friendly messages and saves nothing.

### Summary
Added `lib/validation.ts` with one set of rules (name, category and quantity required; quantity and price not negative; a new category needs a name), used both in the browser on submit and again in the server action before anything is saved. Messages show under each field, and the form keeps what was typed: the browser check stops the submit so nothing is cleared, and after a server check the typed values are sent back and refilled. Added `supabase/migrations/20261103020000_item_checks.sql` with database checks as a backup (no blank names, no negative quantity or price).
Checked the rules against sample inputs (empty form, spaces only, negatives, valid) with a throwaway script; types, lint and build pass. Did not click through in a logged-in browser.
