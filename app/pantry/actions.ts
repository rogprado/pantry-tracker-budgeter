"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ItemFormState = { error?: string } | undefined;

const NEW_CATEGORY = "new";

// Creates an item (itemId undefined) or updates one. Feature 4 adds detailed validation messages.
export async function saveItem(
  itemId: number | undefined,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const supabase = await createClient();
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const numberOrNull = (key: string) => (text(key) === "" ? null : Number(text(key)));
  const dateOrNull = (key: string) => text(key) || null;

  // Category: an existing one, or create a new one (reusing a same-named one if it exists).
  let categoryId: number | null = null;
  const categoryChoice = text("category_id");
  if (categoryChoice === NEW_CATEGORY) {
    const newName = text("new_category");
    if (newName) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", newName)
        .maybeSingle();
      if (existing) {
        categoryId = existing.id;
      } else {
        const { data: created, error } = await supabase
          .from("categories")
          .insert({ name: newName })
          .select("id")
          .single();
        if (error) return { error: "We couldn't create that category. Please try again." };
        categoryId = created.id;
      }
    }
  } else if (categoryChoice) {
    categoryId = Number(categoryChoice);
  }

  const values = {
    name: text("name"),
    category_id: categoryId,
    quantity: numberOrNull("quantity"),
    unit: text("unit") || null,
    price: numberOrNull("price"),
    purchased_on: dateOrNull("purchased_on"),
    expires_on: dateOrNull("expires_on"),
    in_stock: formData.get("in_stock") === "on",
  };

  if (!values.name || values.category_id === null || values.quantity === null || Number.isNaN(values.quantity)) {
    return { error: "Please fill in the name, category and quantity." };
  }

  const query = itemId
    ? supabase.from("pantry_items").update(values).eq("id", itemId).select("id").single()
    : supabase.from("pantry_items").insert(values).select("id").single();
  const { data, error } = await query;
  if (error || !data) return { error: "We couldn't save this item. Please check the fields and try again." };

  revalidatePath("/pantry");
  redirect(`/pantry/${data.id}`);
}

export async function deleteItem(itemId: number) {
  const supabase = await createClient();
  await supabase.from("pantry_items").delete().eq("id", itemId);
  revalidatePath("/pantry");
  redirect("/pantry");
}
