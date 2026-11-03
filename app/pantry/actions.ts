"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  NEW_CATEGORY,
  readItemForm,
  validateItem,
  type FieldErrors,
  type ItemFormValues,
} from "@/lib/validation";

export type ItemFormState =
  | { error?: string; fieldErrors?: FieldErrors; values?: ItemFormValues }
  | undefined;

// Creates an item (itemId undefined) or updates one.
// Validates on the server even though the browser also checks, so nothing invalid is ever saved.
export async function saveItem(
  itemId: number | undefined,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const values = readItemForm(formData);
  const fieldErrors = validateItem(values);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const supabase = await createClient();

  // Category: an existing one, or create a new one (reusing a same-named one if it exists).
  let categoryId: number;
  if (values.category_id === NEW_CATEGORY) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", values.new_category)
      .maybeSingle();
    if (existing) {
      categoryId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from("categories")
        .insert({ name: values.new_category })
        .select("id")
        .single();
      if (error || !created) return { error: "We couldn't create that category. Please try again.", values };
      categoryId = created.id;
    }
  } else {
    categoryId = Number(values.category_id);
  }

  const row = {
    name: values.name,
    category_id: categoryId,
    quantity: Number(values.quantity),
    unit: values.unit || null,
    price: values.price ? Number(values.price) : null,
    purchased_on: values.purchased_on || null,
    expires_on: values.expires_on || null,
    in_stock: values.in_stock,
  };

  const query = itemId
    ? supabase.from("pantry_items").update(row).eq("id", itemId).select("id").single()
    : supabase.from("pantry_items").insert(row).select("id").single();
  const { data, error } = await query;
  if (error || !data) return { error: "We couldn't save this item. Please try again.", values };

  revalidatePath("/pantry");
  redirect(`/pantry/${data.id}`);
}

export async function deleteItem(itemId: number) {
  const supabase = await createClient();
  await supabase.from("pantry_items").delete().eq("id", itemId);
  revalidatePath("/pantry");
  redirect("/pantry");
}
