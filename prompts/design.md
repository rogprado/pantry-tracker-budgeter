# Design pass

## 2026-11-03

New PR: design pass. Follow CLAUDE.md. Show me your plan first.

I've attached a screenshot of another app as inspiration for its level of
polish only: consistent components, generous spacing, designed empty
states and copy with personality. Do not copy its colors, fonts, layout,
text or its dim, library-like mood. My app is about food, so it should
feel fresh, bright, appetizing and practical.

Look and feel:
1. Bright and clean, like a well-lit kitchen: white and very light
   lavender surfaces, soft shadows, rounded cards.
2. Purple as a food color: eggplant/plum for headings and the main
   brand color, a lighter purple for buttons. Fresh accents with
   meaning: herb green = fresh / in stock, citrus amber = use soon,
   tomato red = expired or over budget. Use accents only for status.
3. Friendly, rounded typography: a soft, warm display font for page
   titles and big numbers (Fraunces with its soft style, or similar),
   Nunito for everything else. Headings feel like a recipe card, not a
   novel.
4. Desktop-first: a sidebar with icons and a clear active state, and
   content in a comfortable centered width with generous spacing.
5. Icons from lucide-react for each category (produce, grains, dairy,
   meat and fish, canned, spices, oils and sauces, baking, frozen) so
   items are recognizable at a glance.

Food-specific elements:
- Pantry: items grouped by category like shelves, each with its icon,
  quantity and unit large and clear, and a freshness pill ("3 days
  left" in amber, "Expired" in red, nothing when not perishable).
  Out-of-stock items faded, not hidden.
- Recipes: cards like index cards with title, time, servings, a "You
  have 6 of 7" line and the missing ingredients as small chips.
- Shopping list: a checklist I can tick off, grouped by category, with
  the estimated total against my remaining budget.
- Dashboard: "Use it soon" as the highlighted card at the top, then
  the stats, then the spending chart. Budget as a progress bar that
  shifts green, amber, red.
- Copy in a warm kitchen voice, e.g. "What's in your kitchen?",
  "Use it soon", "Running low", "Where the money went", "Your staples".
- Empty states that tell me the next step, e.g. "Your shelves are
  empty. Add what's in your fridge to get recipe ideas."

How to build it:
- Put colors, fonts, radius, shadows and spacing in one shared place
  (Tailwind theme and globals.css) and build shared components
  (Button, Card, StatCard, Input, EmptyState, PageHeader, CategoryIcon,
  FreshnessPill). Use them on every page instead of styling page by page.
- Restyle every page: login, signup, pantry list, item detail and form,
  staples, dashboard, recipes, shopping list, settings.
- Design for a laptop screen first. On narrow screens, just make sure
  nothing overlaps or gets cut off; no special phone layout yet.
- Body text at least 15px, strong contrast, and never rely on color
  alone: pair every status color with a word or icon.
- Don't change any behavior, data logic or routes. Only the look.

Done when: every page shares one consistent, fresh look, and every
feature still works exactly as before.

ok

## 2026-11-03 (follow-up)

The eggplant as a pantry is very suggestive. Can you change to an stylized P? And add pictures/images of a kitchen? It works, the site is getting really nice

### Summary
Built a shared design system: tokens in `app/globals.css` (eggplant/plum brand, button purple, white and lavender surfaces, herb green / citrus amber / tomato red for status only, soft Fraunces for titles and numbers, Nunito at 15px+), components in `app/components/ui/` (Button, Card, StatCard, Field/Input/Select, EmptyState, PageHeader with optional photo banner, CategoryIcon by keyword, StatusPill, FreshnessPill), and a sidebar with icons and an active state. Restyled every page: login/signup as a split screen with a kitchen photo, dashboard with "Use it soon" first, pantry grouped into category shelves with freshness pills and faded out-of-stock items, item page and form, staples ("Running low" / "On the shelf"), recipes as index cards with time, servings, "You have X of Y" and to-buy chips, shopping as a tickable checklist grouped by category with a sticky budget total, and settings. Replaced the eggplant emoji with an SVG "P" logo (also the favicon) and added four CC0 kitchen photos (credits in `public/images/CREDITS.md`).
Agreed behavior additions: recipe `minutes`/`servings` in the Claude schema and prompt (not saved to the DB), shopping ticks in browser storage, and a read-only `itemsToUseSoon` helper. Checked with before/after screenshots and a 14-step click-through on a temporary account (deleted afterwards); all passed. Fixed along the way: overlapping chart date labels, sidebar background stopping short, "Rice"/"Pecans" matching the wrong category icon, a lint error on dynamic icons, and two click-through test expectations that were mine, not the app's. Unsplash search needed a key and Openverse timed out, so photos came from Wikimedia Commons. Pre-existing `Date.now()` prerender warnings in the server log are unchanged.
