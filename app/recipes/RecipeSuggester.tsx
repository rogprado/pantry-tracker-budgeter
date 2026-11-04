"use client";

import { Check, ChefHat, CircleCheck, Clock, ShoppingBasket, Sparkles, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { saveRecipe } from "@/app/recipes/actions";
import { Button, StatusPill } from "@/app/components/ui";
import type { Recipe } from "@/lib/recipes";

// The "What can I cook?" button and the suggested recipe cards.
export default function RecipeSuggester() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function suggest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes/suggest", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(body.recipes)) {
        setError({
          message: body.error ?? "We couldn't get recipe ideas right now. Please try again in a moment.",
          code: body.code ?? `http_${res.status}`,
        });
      } else {
        setRecipes(body.recipes);
      }
    } catch {
      setError({ message: "We couldn't reach the server. Check your connection and try again.", code: "network" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-lavender-200/70 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lavender-200/70 text-plum">
            <Sparkles size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-eggplant">Fresh ideas from your shelves</h2>
            <p className="text-sm text-muted">3–5 recipes that use what you have, starting with what needs using up.</p>
          </div>
        </div>
        <Button onClick={suggest} disabled={loading} icon={<ChefHat size={18} aria-hidden="true" />}>
          {loading ? "Thinking…" : recipes.length ? "Suggest again" : "What can I cook?"}
        </Button>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-base text-muted" role="status">
          <Clock size={18} aria-hidden="true" /> Peeking into your pantry. This takes about 10 seconds.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-expired-soft px-4 py-3 text-base font-semibold text-expired-ink">
          {error.message}
          {error.code && <span className="ml-2 text-xs font-normal opacity-80">(code: {error.code})</span>}
        </p>
      )}

      {recipes.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {recipes.map((r) => (
            <RecipeCard key={r.title} recipe={r} />
          ))}
        </div>
      )}
    </section>
  );
}

// An index card: title, time and servings, "You have 6 of 7", missing items as chips, then the method.
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const have = recipe.ingredients.filter((i) => i.in_pantry).length;
  const missing = recipe.ingredients.filter((i) => !i.in_pantry);

  const save = () =>
    startTransition(async () => {
      const result = await saveRecipe(recipe);
      if (result.error) setError(result.error);
      else setSaved(true);
    });

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-lavender-200/70 bg-white shadow-card">
      {/* index-card top rule */}
      <div className="h-2 bg-primary/80" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-semibold text-eggplant">{recipe.title}</h3>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-muted">
              {recipe.minutes > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock size={16} aria-hidden="true" /> {recipe.minutes} min
                </span>
              )}
              {recipe.servings > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users size={16} aria-hidden="true" /> Serves {recipe.servings}
                </span>
              )}
            </p>
          </div>
          <Button onClick={save} disabled={pending || saved} variant={saved ? "secondary" : "primary"} size="sm" icon={saved ? <Check size={16} aria-hidden="true" /> : undefined}>
            {saved ? "Saved" : pending ? "Saving…" : "Save"}
          </Button>
        </header>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-base font-bold text-fresh-ink">
            <CircleCheck size={18} aria-hidden="true" />
            You have {have} of {recipe.ingredients.length}
          </p>
          {missing.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-muted">To buy:</span>
              {missing.map((i) => (
                <span key={i.name} className="inline-flex items-center gap-1 rounded-full bg-lavender-200/70 px-2.5 py-0.5 text-sm font-semibold text-eggplant">
                  <ShoppingBasket size={14} aria-hidden="true" /> {i.name}
                </span>
              ))}
            </div>
          )}
          {recipe.uses_expiring.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-muted">Uses up:</span>
              {recipe.uses_expiring.map((n) => (
                <StatusPill key={n} tone="soon">
                  {n}
                </StatusPill>
              ))}
            </div>
          )}
        </div>

        <details className="group rounded-2xl bg-lavender p-4">
          <summary className="cursor-pointer text-sm font-bold text-plum group-open:mb-3">Ingredients and method</summary>
          <ul className="mb-3 grid gap-x-4 gap-y-0.5 text-sm sm:grid-cols-2">
            {recipe.ingredients.map((i, n) => (
              <li key={n} className={i.in_pantry ? "text-ink" : "text-muted"}>
                {i.amount} {i.name}
                {!i.in_pantry && <span className="text-xs font-bold"> (to buy)</span>}
              </li>
            ))}
          </ul>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-ink">
            {recipe.steps.map((s, n) => (
              <li key={n}>{s}</li>
            ))}
          </ol>
        </details>

        {error && <p className="text-sm font-semibold text-expired-ink">{error}</p>}
      </div>
    </article>
  );
}
