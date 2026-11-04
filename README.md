# Pantry

Pantry keeps track of everything in your kitchen, suggests recipes from what you already have, builds a
shopping list that fits your budget, and shows where your grocery money goes.

**Live app:** https://pantry-tracker-budgeter.vercel.app

Built solo for the Haas MBA Solo Demo Day with [Claude Code](https://claude.com/claude-code). The plan,
including what changed along the way, is in [PLAN.md](PLAN.md), and the database is described in
[schema.md](schema.md).

## What it does

- **Accounts:** sign up with email and password, Google or GitHub. Each person only ever sees their own
  data.
- **Pantry:** add items with category, quantity, unit, price, purchase and expiry dates. Items are
  grouped into shelves, with "3 days left" or "Expired" labels.
  - Quick **− / +**, **Used half** and **Used all** on every item, with **Undo**.
  - Search, filter by category or stock, and sort by expiry, newest or price.
  - **Import from a spreadsheet** (.csv or .xlsx): a preview flags problem rows, and items you already
    have are topped up instead of duplicated.
- **Staples:** star the things you always want at home and see which ones are running low.
- **Dashboard:** what to use soon, this month's spending, items in stock, and charts of spending by
  category and over time, for any month, year or all time.
- **What can I cook?** Claude suggests 3–5 recipes from what's in stock, starting with what expires
  soonest. Save the ones you like, and use **I cooked this** to take the ingredients off your shelves.
- **Smart shopping list:** your out-of-stock staples plus up to 5 versatile ingredients Claude
  suggests, trimmed to fit what's left of your budget. Tick items off in the shop.
- **Budget:** set a monthly budget and watch a bar turn amber at 80% and red over 100%.

## Tools

| What | Tool |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) with TypeScript and React 19 |
| Styling | Tailwind CSS 4, Inter and Newsreader fonts, [Lucide](https://lucide.dev) icons |
| Database and login | [Supabase](https://supabase.com): Postgres with row-level security, and Auth (email, Google, GitHub) |
| AI | Claude API (`claude-sonnet-5-5`) with the Anthropic TypeScript SDK; replies are checked with `zod` |
| Charts | Recharts |
| Spreadsheets | Papa Parse (CSV) and read-excel-file (.xlsx) |
| Tests | Vitest |
| Hosting | [Vercel](https://vercel.com) |
| Coding agent | Claude Code (every prompt is logged in [`prompts/`](prompts)) |

## Run it yourself

You need **Node.js 20.9 or newer**, a free **Supabase** project, and an **Anthropic API key** for the
two Claude features (each request costs about 1–2 cents).

1. **Get the code and install packages**
   ```bash
   git clone https://github.com/rogprado/pantry-tracker-budgeter.git
   cd pantry-tracker-budgeter
   npm install
   ```

2. **Set up the database.** In your Supabase project, open the **SQL Editor** and run each file in
   [`supabase/migrations/`](supabase/migrations) **in order** (the file names start with the date):
   1. `20261103000000_create_users.sql`
   2. `20261103010000_create_data_model.sql`
   3. `20261103020000_item_checks.sql`
   4. `20261103030000_users_update_budget.sql`
   5. `20261104000000_stock_movements.sql`

   For quick local testing, you can turn off **Confirm email** under Authentication → Sign In / Providers
   → Email.

3. **Add your keys.** Copy the example file and fill it in:
   ```bash
   cp .env.example .env.local
   ```
   | Variable | Where to find it |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys (starts with `sb_publishable_`) |
   | `SUPABASE_SECRET_KEY` | Same page (starts with `sb_secret_`). Only used by the tests. |
   | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |

   `.env.local` is ignored by git. Never commit real keys; this repo is public.

4. **Start the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000, sign up, and add your first items.

5. **Optional: Google and GitHub login.** Create an OAuth app on each, using
   `https://<your-project>.supabase.co/auth/v1/callback` as the callback URL. Paste the client ID and
   secret into Supabase → Authentication → Sign In / Providers. Then add
   `http://localhost:3000/auth/callback` (and your live URL + `/auth/callback`) under Authentication →
   URL Configuration → Redirect URLs.

### Tests

```bash
npm test
```

- **Data isolation** (`tests/data-isolation.test.ts`): creates two temporary users in your Supabase
  project, checks that one can't see the other's items, then deletes both. It needs
  `SUPABASE_SECRET_KEY`.
- **Dashboard spending, quantity steps and spreadsheet rows**: plain unit tests, no database needed.

### Deploy

Import the repo in Vercel, add the four environment variables (Production and Preview), and deploy.
Vercel redeploys every time `main` changes.

## Project layout

```
app/                 pages (dashboard, pantry, recipes, shopping, settings, login) and server actions
app/api/             server routes that call Claude (recipes, shopping)
app/components/ui/   shared design components (Button, Card, StatusPill, …)
lib/                 pure logic: stats, budget, validation, import rows, quantity steps, Claude prompts
supabase/migrations/ the database, as SQL files
tests/               Vitest tests
prompts/             every prompt given to Claude Code, with a summary of what was built
```

Photo credits: [`public/images/CREDITS.md`](public/images/CREDITS.md) (all CC0).
