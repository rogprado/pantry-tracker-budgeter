"use client";

import { Check, ChefHat, CircleAlert, Clock, Lightbulb, ShoppingBasket, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, CategoryIcon, EmptyState } from "@/app/components/ui";
import { useTicks } from "@/app/shopping/useTicks";
import { fitToBudget, type Staple, type Suggestion } from "@/lib/shopping";

const money = (n: number) => `$${n.toFixed(2)}`;

export type BudgetInfo = { monthly: number; spent: number; remaining: number; month: string } | null;
export type ShoppingStaple = Staple & { category: string };

export default function ShoppingList({ staples, budget }: { staples: ShoppingStaple[]; budget: BudgetInfo }) {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { ticked, toggle } = useTicks();

  const fit = fitToBudget(staples, suggestions ?? [], budget ? budget.remaining : null);
  const over = fit.remaining !== null && fit.total > fit.remaining;

  // Staples grouped by their category, like aisles.
  const aisles = new Map<string, ShoppingStaple[]>();
  for (const s of staples) aisles.set(s.category, [...(aisles.get(s.category) ?? []), s]);
  const orderedAisles = [...aisles].sort(([a], [b]) => a.localeCompare(b));

  async function suggest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shopping/suggest", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(body.suggestions)) {
        setError({
          message: body.error ?? "We couldn't get suggestions right now. Please try again in a moment.",
          code: body.code ?? `http_${res.status}`,
        });
      } else {
        setSuggestions(body.suggestions);
      }
    } catch {
      setError({ message: "We couldn't reach the server. Check your connection and try again.", code: "network" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        {/* Part 1: staples to restock, grouped by category */}
        <section className="space-y-3">
          <h2 className="font-display flex items-center gap-2 text-2xl font-medium text-eggplant">
            <Star size={22} className="text-primary" fill="currentColor" aria-hidden="true" /> Running low
          </h2>
          {staples.length === 0 ? (
            <EmptyState
              compact
              icon={<Star size={24} aria-hidden="true" />}
              title="All your staples are stocked"
              body={
                <>
                  Nothing to restock. Star the things you always keep around on your{" "}
                  <Link href="/pantry" className="font-semibold text-plum">pantry</Link> and they&apos;ll show up here when they run out.
                </>
              }
            />
          ) : (
            orderedAisles.map(([category, items]) => (
              <div key={category} className="rounded-card border border-lavender-200 bg-white">
                <div className="flex items-center gap-3 border-b border-lavender-200 px-5 py-3">
                  <CategoryIcon name={category} size="sm" />
                  <h3 className="font-semibold text-eggplant">{category}</h3>
                </div>
                <ul className="divide-y divide-lavender-200/70">
                  {items.map((s) => (
                    <CheckRow
                      key={s.id}
                      checked={ticked.has(`staple:${s.id}`)}
                      onToggle={() => toggle(`staple:${s.id}`)}
                      name={s.name}
                      detail={s.price === null ? "No price yet" : "Last price you paid"}
                      price={s.price === null ? "—" : money(s.price)}
                    />
                  ))}
                </ul>
              </div>
            ))
          )}
          {staples.some((s) => s.price === null) && (
            <p className="text-sm text-muted">Staples without a price count as $0 in the total.</p>
          )}
        </section>

        {/* Part 2: Claude's suggestions */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display flex items-center gap-2 text-2xl font-medium text-eggplant">
              <Lightbulb size={22} className="text-primary" aria-hidden="true" /> Worth trying
            </h2>
            <Button onClick={suggest} disabled={loading} icon={<Sparkles size={18} aria-hidden="true" />}>
              {loading ? "Thinking…" : suggestions ? "Suggest again" : "Suggest ingredients"}
            </Button>
          </div>

          {!suggestions && !loading && !error && (
            <EmptyState
              compact
              icon={<ChefHat size={24} aria-hidden="true" />}
              title="A few smart buys"
              body="Get up to 5 ingredients that would unlock the most new dishes with what you already have, each with a price estimate."
            />
          )}
          {loading && (
            <p className="flex items-center gap-2 text-base text-muted" role="status">
              <Clock size={18} aria-hidden="true" /> Looking at your shelves. This takes about 10 seconds.
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-lg bg-expired-soft px-4 py-3 text-base font-semibold text-expired-ink">
              {error.message}
              {error.code && <span className="ml-2 text-xs font-normal opacity-80">(code: {error.code})</span>}
            </p>
          )}

          {suggestions && fit.kept.length > 0 && (
            <ol className="divide-y divide-lavender-200/70 rounded-card border border-lavender-200 bg-white">
              {fit.kept.map((s, n) => (
                <CheckRow
                  key={s.name}
                  checked={ticked.has(`idea:${s.name.toLowerCase()}`)}
                  onToggle={() => toggle(`idea:${s.name.toLowerCase()}`)}
                  name={`${n + 1}. ${s.name}`}
                  detail={s.reason}
                  price={`~${money(s.estimated_price)}`}
                />
              ))}
            </ol>
          )}

          {fit.dropped.length > 0 && (
            <div className="rounded-card border-2 border-dashed border-lavender-300 bg-white/60 p-5">
              <h3 className="text-sm font-semibold text-muted">Left out to stay on budget</h3>
              <ul className="mt-2 space-y-1 text-base text-muted">
                {fit.dropped.map((s) => (
                  <li key={s.name} className="flex justify-between gap-4">
                    <span>{s.name}</span>
                    <span>~{money(s.estimated_price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {suggestions && <p className="text-sm text-muted">Prices are Claude&apos;s estimates for one standard package.</p>}
        </section>
      </div>

      {/* Budget summary, kept in view while scrolling on laptops */}
      <aside className={`space-y-3 rounded-card border bg-white p-6 lg:sticky lg:top-8 ${over ? "border-expired/40" : "border-lavender-200"}`}>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted">
          <ShoppingBasket size={18} className="text-plum" aria-hidden="true" /> Estimated total
        </h2>
        <p className="font-display text-5xl font-medium text-eggplant">{money(fit.total)}</p>
        {budget ? (
          <>
            <p className="text-base text-muted">
              of <span className="font-semibold text-ink">{money(budget.remaining)}</span> left in your {budget.month} budget
            </p>
            {over ? (
              <p className="flex items-start gap-2 rounded-lg bg-expired-soft p-3 text-sm font-semibold text-expired-ink" role="status">
                <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                {fit.staplesOverBudget
                  ? `Your staples alone come to ${money(fit.staplesTotal)}, more than the ${money(Math.max(0, budget.remaining))} left, so no extras were added.`
                  : "This list is over what's left this month."}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm font-semibold text-fresh-ink">
                <Check size={18} aria-hidden="true" /> Fits your budget
              </p>
            )}
          </>
        ) : (
          <p className="text-base text-muted">
            No monthly budget set, so nothing is left out for cost.{" "}
            <Link href="/settings" className="font-semibold text-plum">Set one</Link>
          </p>
        )}
        <p className="border-t border-lavender-200 pt-3 text-sm text-muted">Ticks are saved on this device so you can check things off in the shop.</p>
      </aside>
    </div>
  );
}

// A checklist row: a big tick box, the name and a line under it, and the price.
function CheckRow({ checked, onToggle, name, detail, price }: { checked: boolean; onToggle: () => void; name: string; detail: string; price: string }) {
  return (
    <li>
      <label className="flex cursor-pointer items-start gap-4 px-5 py-4 transition hover:bg-lavender/60">
        <input type="checkbox" checked={checked} onChange={onToggle} className="peer sr-only" />
        <span
          aria-hidden="true"
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25 ${
            checked ? "border-fresh bg-fresh text-white" : "border-lavender-300 bg-white"
          }`}
        >
          {checked && <Check size={16} strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-base font-semibold ${checked ? "text-muted line-through" : "text-ink"}`}>{name}</span>
          <span className="block text-sm text-muted">{detail}</span>
        </span>
        <span className={`shrink-0 text-base font-semibold ${checked ? "text-muted" : "text-eggplant"}`}>{price}</span>
      </label>
    </li>
  );
}
