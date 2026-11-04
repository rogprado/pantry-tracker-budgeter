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

// Starring adds a row to the stars junction table; unstarring deletes it.
export async function setStar(itemId: number, starred: boolean) {
  const supabase = await createClient();
  if (starred) {
    const { error } = await supabase.from("stars").insert({ item_id: itemId });
    // 23505 = already starred (e.g. a double click); that's fine.
    if (error && error.code !== "23505") throw new Error("Couldn't star this item.");
  } else {
    const { error } = await supabase.from("stars").delete().eq("item_id", itemId);
    if (error) throw new Error("Couldn't unstar this item.");
  }
  revalidatePath("/pantry", "layout");
}

// ---------- quick quantity updates ----------

export type MovementResult = { ok: true; movementId: number } | { ok: false; error: string };

// Use or buy some of an item. The database function logs the movement and updates
// quantity + in-stock in one transaction, as the signed-in user (RLS applies).
export async function recordMovement(itemId: number, kind: "use" | "purchase", amount: number): Promise<MovementResult> {
  if (!Number.isInteger(itemId) || (kind !== "use" && kind !== "purchase") || !(amount > 0) || amount > 100000) {
    return { ok: false, error: "That change doesn't look right." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_movement", { p_item_id: itemId, p_kind: kind, p_amount: amount });
  if (error || !data) {
    console.error("record_movement failed", error?.code, error?.message);
    return { ok: false, error: "We couldn't update this item. Please try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true, movementId: (data as { id: number }).id };
}

// Put the item back exactly as it was before that movement.
export async function undoMovement(movementId: number): Promise<{ ok: boolean }> {
  if (!Number.isInteger(movementId)) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.rpc("undo_movement", { p_movement_id: movementId });
  if (error) {
    console.error("undo_movement failed", error.code, error.message);
    return { ok: false };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
