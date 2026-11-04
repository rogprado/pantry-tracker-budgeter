# Feature 8: What can I cook?

## 2026-11-03

Feature 8: What can I cook? Follow CLAUDE.md. Show me your plan first.
- A button on /recipes that sends my in-stock items (name, quantity,
  unit, expiry) to Claude from a server route and asks for 3-5 recipes as
  JSON: title, ingredients (marking any I don't have), short instructions,
  and which soon-to-expire items it uses.
- Use mostly what I have, favoring items that expire soonest.
- Show them as cards with a Save button that stores the recipe in the
  recipes table, and a "Saved recipes" list below.
- Keep the instructions sent to Claude in lib/prompts/recipes.ts. Show a
  friendly message if the call fails.
Done when: I get sensible recipes from my real pantry and can save one.

Yes, please do the test. I am in the console and my key starts with sk-ant-usr

### Summary
Added /recipes with a "What can I cook?" button that POSTs to `app/api/recipes/suggest/route.ts`. The route loads my in-stock items (name, quantity, unit, expiry only) through Supabase/RLS and calls `claude-sonnet-5-5` with structured outputs (a zod schema: title, ingredients with in_pantry, steps, uses_expiring) and server-side refusal fallback (`fallbacks: "default"`). The reply is checked again in `lib/recipes.ts` (3-5 recipes, nothing blank, "uses soon" names must be real pantry items) before it's shown. Cards mark "Need to buy" ingredients and "Uses soon" items; Save stores the recipe in `recipes` as text, and saved recipes are listed below. Instructions to Claude live in `lib/prompts/recipes.ts`; every failure shows a friendly message and the detail goes only to the server log.
Tested with one real call on a made-up pantry (no database): 4 valid recipes in 11 s, ~2 cents, using the soon-to-expire spinach/eggs/yogurt first; the `sk-ant-usr-` key works. Types, lint, build and logged-out behavior (page redirect, API 401) checked. Also let the header wrap on narrow screens now that it has four links. I did not click through the page while logged in.

## 2026-11-03 (follow-up)

We couldn't get recipe ideas right now. Please try again in a moment.
(Works on localhost; the Vercel preview still fails after checking the env var and redeploying.)

### Summary
Local run succeeded (`POST /api/recipes/suggest 200 in 10.7s`), so the code and key work and the failure is specific to Vercel. Since I can't read Vercel's logs, I added a short, non-secret error code next to the friendly message (e.g. `no_key`, `key_rejected_401`, `connection`, `api_500`, `invalid_reply`, or `http_504` when the host answers instead of our route) so the cause can be read off the screen.
