import { z } from "zod";

// ---------- Claude's reply ----------

export const SuggestionSchema = z.object({
  name: z.string(),
  reason: z.string(),
  estimated_price: z.number(),
});
export const ShoppingResponseSchema = z.object({ suggestions: z.array(SuggestionSchema) });
export type Suggestion = z.infer<typeof SuggestionSchema>;

const norm = (s: string) => s.trim().toLowerCase();

// Checks the schema can't express: at most 5, nothing blank, a sensible price,
// and nothing the user already has or is restocking. Keeps Claude's ranking order.
export function cleanSuggestions(raw: unknown, alreadyHave: string[]): Suggestion[] | null {
  const parsed = ShoppingResponseSchema.safeParse(raw);
  if (!parsed.success) return null;
  const have = new Set(alreadyHave.map(norm));
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const s of parsed.data.suggestions) {
    const name = s.name.trim();
    const key = norm(name);
    if (!name || !s.reason.trim() || have.has(key) || seen.has(key)) continue;
    if (!(s.estimated_price > 0 && s.estimated_price <= 100)) continue;
    seen.add(key);
    out.push({ name, reason: s.reason.trim(), estimated_price: Math.round(s.estimated_price * 100) / 100 });
    if (out.length === 5) break;
  }
  return out.length ? out : null;
}

// ---------- budget ----------

export type Staple = { id: number; name: string; price: number | null };

export type BudgetFit = {
  staplesTotal: number;
  kept: Suggestion[]; // in priority order
  dropped: Suggestion[]; // lowest priority, left out to stay on budget
  total: number; // staples + kept
  remaining: number | null; // budget left this month, null = no budget set
  staplesOverBudget: boolean;
};

const cents = (n: number) => Math.round(n * 100) / 100;

// Staples always stay. Suggestions are ranked most useful first; if the total is over what's
// left of the budget, drop suggestions from the end (least useful) until it fits.
// Staples without a price count as $0.
export function fitToBudget(staples: Staple[], suggestions: Suggestion[], remaining: number | null): BudgetFit {
  const staplesTotal = cents(staples.reduce((s, i) => s + (i.price ?? 0), 0));
  const kept = [...suggestions];
  const dropped: Suggestion[] = [];
  const sum = () => cents(staplesTotal + kept.reduce((s, i) => s + i.estimated_price, 0));

  if (remaining !== null) {
    while (kept.length && sum() > remaining) dropped.unshift(kept.pop()!);
  }
  return {
    staplesTotal,
    kept,
    dropped,
    total: sum(),
    remaining: remaining === null ? null : cents(remaining),
    staplesOverBudget: remaining !== null && staplesTotal > remaining,
  };
}
