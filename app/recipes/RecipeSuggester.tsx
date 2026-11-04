"use client";

import { useState, useTransition } from "react";
import type { Recipe } from "@/lib/recipes";
import { saveRecipe } from "@/app/recipes/actions";

// The "What can I cook?" button and the suggested recipe cards.
export default function RecipeSuggester() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function suggest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes/suggest", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(body.recipes)) {
        setError(body.error ?? "We couldn't get recipe ideas right now. Please try again in a moment.");
      } else {
        setRecipes(body.recipes);
      }
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <p className="text-gray-600">Get 3–5 ideas that use what&apos;s in stock, starting with what expires soonest.</p>
        <button type="button" onClick={suggest} disabled={loading} className="btn">
          {loading ? "Thinking…" : recipes.length ? "Suggest again" : "What can I cook?"}
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Asking Claude about your pantry. This takes about 10 seconds.</p>}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {recipes.map((r) => (
        <RecipeCard key={r.title} recipe={r} />
      ))}
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const result = await saveRecipe(recipe);
      if (result.error) setError(result.error);
      else setSaved(true);
    });

  return (
    <article className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-heading">{recipe.title}</h2>
        <button type="button" onClick={save} disabled={pending || saved} className={saved ? "btn-outline py-2" : "btn"}>
          {saved ? "Saved ✓" : pending ? "Saving…" : "Save"}
        </button>
      </div>

      {recipe.uses_expiring.length > 0 && (
        <p className="flex flex-wrap gap-1.5 text-xs">
          <span className="font-semibold text-gray-600">Uses soon:</span>
          {recipe.uses_expiring.map((n) => (
            <span key={n} className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">
              {n}
            </span>
          ))}
        </p>
      )}

      <div>
        <h3 className="text-sm font-semibold">Ingredients</h3>
        <ul className="mt-1 space-y-0.5 text-sm">
          {recipe.ingredients.map((i, n) => (
            <li key={n}>
              {i.amount} {i.name}
              {!i.in_pantry && (
                <span className="ml-2 rounded-full bg-lavender px-2 py-0.5 text-xs font-semibold text-heading">Need to buy</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Steps</h3>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">
          {recipe.steps.map((s, n) => (
            <li key={n}>{s}</li>
          ))}
        </ol>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </article>
  );
}
