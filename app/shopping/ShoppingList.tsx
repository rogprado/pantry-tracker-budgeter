"use client";

import Link from "next/link";
import { useState } from "react";
import { fitToBudget, type Staple, type Suggestion } from "@/lib/shopping";

const money = (n: number) => `$${n.toFixed(2)}`;

export type BudgetInfo = { monthly: number; spent: number; remaining: number; month: string } | null;

export default function ShoppingList({ staples, budget }: { staples: Staple[]; budget: BudgetInfo }) {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fit = fitToBudget(staples, suggestions ?? [], budget ? budget.remaining : null);

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
    <div className="space-y-6">
      {/* Budget summary */}
      <section className={`card space-y-1 ${fit.remaining !== null && fit.total > fit.remaining ? "ring-2 ring-danger/40" : ""}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold text-heading">Estimated total</h2>
          <p className="text-2xl font-extrabold text-heading">
            {money(fit.total)}
            {budget && <span className="text-base font-semibold text-gray-600"> of {money(budget.remaining)} left</span>}
          </p>
        </div>
        {budget ? (
          <p className="text-sm text-gray-600">
            {budget.month} budget {money(budget.monthly)} · spent {money(budget.spent)} · left {money(budget.remaining)}
          </p>
        ) : (
          <p className="text-sm text-gray-600">No monthly budget set, so nothing is left out for cost.</p>
        )}
        {fit.staplesOverBudget && (
          <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
            Your staples alone come to {money(fit.staplesTotal)}, which is more than the {money(Math.max(0, budget!.remaining))} left
            this month, so no extra ingredients were added.
          </p>
        )}
      </section>

      {/* Part 1: staples to restock */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-heading">Staples to restock</h2>
        {staples.length === 0 ? (
          <div className="card text-gray-600">
            None of your staples are out of stock. Star items on your{" "}
            <Link href="/pantry" className="font-semibold text-primary">pantry</Link> to track them here.
          </div>
        ) : (
          <ul className="card divide-y divide-lavender p-0">
            {staples.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <Link href={`/pantry/${s.id}`} className="font-semibold hover:text-primary">
                  <span className="mr-1 text-warning">★</span> {s.name}
                </Link>
                <span className="text-sm text-gray-600">{s.price === null ? "no price yet" : money(s.price)}</span>
              </li>
            ))}
          </ul>
        )}
        {staples.some((s) => s.price === null) && (
          <p className="text-xs text-gray-500">Staples without a price count as $0. Prices are the last ones you entered.</p>
        )}
      </section>

      {/* Part 2: Claude's suggestions */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-heading">Versatile ingredients</h2>
          <button type="button" onClick={suggest} disabled={loading} className="btn">
            {loading ? "Thinking…" : suggestions ? "Suggest again" : "Suggest ingredients"}
          </button>
        </div>
        {!suggestions && !loading && !error && (
          <div className="card text-gray-600">
            Up to 5 ingredients that would unlock the most new dishes with what you already have, with estimated prices.
          </div>
        )}
        {loading && <p className="text-sm text-gray-500">Asking Claude about your pantry. This takes about 10 seconds.</p>}
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
            {error.message}
            {error.code && <span className="ml-2 text-xs opacity-70">(code: {error.code})</span>}
          </p>
        )}

        {suggestions && fit.kept.length > 0 && (
          <ol className="card divide-y divide-lavender p-0">
            {fit.kept.map((s, n) => (
              <li key={s.name} className="flex items-start justify-between gap-4 px-5 py-3">
                <div>
                  <p className="font-semibold">
                    <span className="mr-2 text-sm text-gray-400">{n + 1}.</span>
                    {s.name}
                  </p>
                  <p className="text-sm text-gray-600">{s.reason}</p>
                </div>
                <span className="shrink-0 text-sm text-gray-600">~{money(s.estimated_price)}</span>
              </li>
            ))}
          </ol>
        )}

        {fit.dropped.length > 0 && (
          <div className="card space-y-2 bg-white/60">
            <h3 className="text-sm font-semibold text-gray-600">Left out to stay on budget</h3>
            <ul className="space-y-1 text-sm text-gray-500">
              {fit.dropped.map((s) => (
                <li key={s.name} className="flex justify-between gap-4">
                  <span>{s.name}</span>
                  <span>~{money(s.estimated_price)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {suggestions && <p className="text-xs text-gray-500">Prices are Claude&apos;s estimates for one standard package.</p>}
      </section>
    </div>
  );
}
