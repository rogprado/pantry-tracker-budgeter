import { BookHeart } from "lucide-react";
import { redirect } from "next/navigation";
import RecipeSuggester from "@/app/recipes/RecipeSuggester";
import { EmptyState, PageHeader } from "@/app/components/ui";
import { createClient } from "@/lib/supabase/server";
import vegetableBasket from "@/public/images/vegetable-basket.jpg";

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
    <div className="space-y-10">
      <PageHeader
        eyebrow="Recipes"
        title="What can I cook?"
        subtitle="Dinner ideas built from what's already on your shelves, so less goes to waste."
        image={vegetableBasket}
        imageAlt="A wooden basket of fresh carrots and onions"
      />

      <RecipeSuggester />

      <section className="space-y-4">
        <h2 className="font-display text-3xl font-semibold text-eggplant">Your recipe box</h2>
        {!saved?.length ? (
          <EmptyState
            compact
            icon={<BookHeart size={26} aria-hidden="true" />}
            title="No saved recipes yet"
            body="When an idea sounds good, tap Save on its card and it will wait for you here."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {saved.map((r) => (
              <details key={r.id} className="group overflow-hidden rounded-card border border-lavender-200/70 bg-white shadow-card">
                <summary className="flex cursor-pointer items-center gap-3 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lavender-200/70 text-plum">
                    <BookHeart size={20} aria-hidden="true" />
                  </span>
                  <span className="font-display flex-1 text-xl font-semibold text-eggplant">{r.title}</span>
                  <span className="text-sm font-bold text-plum group-open:hidden">Open</span>
                </summary>
                <div className="grid gap-4 border-t border-lavender-200 p-5 text-sm sm:grid-cols-2">
                  <div>
                    <h3 className="font-bold text-ink">Ingredients</h3>
                    <p className="mt-1 whitespace-pre-line text-muted">{r.ingredients}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-ink">Method</h3>
                    <p className="mt-1 whitespace-pre-line text-muted">{r.instructions}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
