import { redirect } from "next/navigation";
import RecipeSuggester from "@/app/recipes/RecipeSuggester";
import { createClient } from "@/lib/supabase/server";

export default async function RecipesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  // RLS returns only my saved recipes.
  const { data: saved } = await supabase
    .from("recipes")
    .select("id, title, ingredients, instructions, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">What can I cook?</h1>
      <RecipeSuggester />

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-heading">Saved recipes</h2>
        {!saved?.length ? (
          <div className="card text-gray-600">No saved recipes yet. Tap Save on a suggestion to keep it here.</div>
        ) : (
          saved.map((r) => (
            <details key={r.id} className="card group">
              <summary className="cursor-pointer font-semibold text-heading">{r.title}</summary>
              <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold">Ingredients</h3>
                  <p className="mt-1 whitespace-pre-line text-gray-700">{r.ingredients}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Steps</h3>
                  <p className="mt-1 whitespace-pre-line text-gray-700">{r.instructions}</p>
                </div>
              </div>
            </details>
          ))
        )}
      </section>
    </div>
  );
}
