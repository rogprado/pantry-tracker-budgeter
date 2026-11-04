"use server";

import { revalidatePath } from "next/cache";
import { RecipeSchema, recipeToRow } from "@/lib/recipes";
import { createClient } from "@/lib/supabase/server";

// Saves one suggested recipe to the recipes table (user_id defaults to the logged-in user).
export async function saveRecipe(recipe: unknown): Promise<{ error?: string }> {
  const parsed = RecipeSchema.safeParse(recipe);
  if (!parsed.success || !parsed.data.title.trim()) return { error: "This recipe couldn't be saved." };

  const supabase = await createClient();
  const { error } = await supabase.from("recipes").insert(recipeToRow(parsed.data));
  if (error) return { error: "We couldn't save this recipe. Please try again." };

  revalidatePath("/recipes");
  return {};
}
