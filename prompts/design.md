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
