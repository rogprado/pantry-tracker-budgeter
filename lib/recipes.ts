import { z } from "zod";

// The JSON shape Claude must return. Sent to the API as a structured-output schema,
// then checked again here before anything is shown or saved.
export const RecipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string(), in_pantry: z.boolean() })),
  steps: z.array(z.string()),
  uses_expiring: z.array(z.string()),
});
export const RecipesResponseSchema = z.object({ recipes: z.array(RecipeSchema) });

export type Recipe = z.infer<typeof RecipeSchema>;

// Extra checks the schema can't express: 3-5 recipes, nothing blank, and
// uses_expiring only lists items that are really in the pantry.
export function cleanRecipes(raw: unknown, pantryNames: string[]): Recipe[] | null {
  const parsed = RecipesResponseSchema.safeParse(raw);
  if (!parsed.success) return null;
  const known = new Map(pantryNames.map((n) => [n.trim().toLowerCase(), n]));
  const recipes = parsed.data.recipes
    .map((r) => ({
      title: r.title.trim(),
      ingredients: r.ingredients
        .map((i) => ({ ...i, name: i.name.trim(), amount: i.amount.trim() }))
        .filter((i) => i.name),
      steps: r.steps.map((s) => s.trim()).filter(Boolean),
      uses_expiring: [...new Set(r.uses_expiring.map((n) => known.get(n.trim().toLowerCase())).filter((n): n is string => !!n))],
    }))
    .filter((r) => r.title && r.ingredients.length > 0 && r.steps.length > 0)
    .slice(0, 5);
  return recipes.length >= 3 ? recipes : null;
}

// The recipes table stores ingredients and instructions as text, one per line.
export function recipeToRow(r: Recipe) {
  return {
    title: r.title,
    ingredients: r.ingredients
      .map((i) => `${i.amount} ${i.name}`.trim() + (i.in_pantry ? "" : " (need to buy)"))
      .join("\n"),
    instructions: r.steps.map((s, n) => `${n + 1}. ${s}`).join("\n"),
  };
}
