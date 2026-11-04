"use server";

import { revalidatePath } from "next/cache";
import { MAX_ROWS, checkRow, type RawRow } from "@/lib/importRows";
import { createClient } from "@/lib/supabase/server";

export type ImportOutcome = { line: number; name: string; status: "created" | "added" | "unchanged" | "skipped" | "failed"; message: string };

const COLUMNS = ["name", "category", "quantity", "unit", "price", "purchased_on", "expires_on"] as const;

// Saves the valid rows. Every row is checked again here (never trust the browser);
// rows with problems are skipped. Same name as an existing item = a purchase on that item.
export async function importItems(input: { line: number; raw: RawRow }[]): Promise<{ outcomes: ImportOutcome[]; error?: string }> {
  if (!Array.isArray(input) || input.length === 0) return { outcomes: [], error: "There's nothing to import." };
  if (input.length > MAX_ROWS) return { outcomes: [], error: `That's more than ${MAX_ROWS} rows. Please split the file.` };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { outcomes: [], error: "Please log in again." };

  // Everything below runs as the signed-in user, so RLS limits it to their own rows.
  const [{ data: cats }, { data: items }] = await Promise.all([
    supabase.from("categories").select("id, name"),
    supabase.from("pantry_items").select("id, name"),
  ]);
  const categoryIds = new Map((cats ?? []).map((c) => [c.name.trim().toLowerCase(), c.id as number]));
  const itemIds = new Map((items ?? []).map((i) => [i.name.trim().toLowerCase(), i.id as number]));

  const outcomes: ImportOutcome[] = [];
  for (const entry of input) {
    // Rebuild the raw row from known columns only, as plain strings.
    const raw = Object.fromEntries(COLUMNS.map((c) => [c, String(entry?.raw?.[c] ?? "").slice(0, 200)])) as RawRow;
    const line = Number(entry?.line) || 0;
    const checked = checkRow(line, raw);
    if (!checked.row) {
      outcomes.push({ line, name: raw.name || "(no name)", status: "skipped", message: checked.problems.join(". ") });
      continue;
    }
    const row = checked.row;
    const key = row.name.toLowerCase();

    // Already on the shelves: add the quantity as a purchase (logged, so Undo/tracking stay correct).
    const existingId = itemIds.get(key);
    if (existingId) {
      if (row.quantity === 0) {
        outcomes.push({ line, name: row.name, status: "unchanged", message: "Already in your pantry; quantity 0, so nothing to add" });
        continue;
      }
      const { error } = await supabase.rpc("record_movement", { p_item_id: existingId, p_kind: "purchase", p_amount: row.quantity });
      outcomes.push(
        error
          ? { line, name: row.name, status: "failed", message: "Couldn't add to the existing item" }
          : { line, name: row.name, status: "added", message: `Added ${row.quantity}${row.unit ? ` ${row.unit}` : ""} to the item you already have` },
      );
      if (error) console.error("import: record_movement failed", error.code, error.message);
      continue;
    }

    // New item: find or create its category first.
    let categoryId = categoryIds.get(row.category.toLowerCase());
    if (!categoryId) {
      const { data: created, error } = await supabase.from("categories").insert({ name: row.category }).select("id").single();
      if (error || !created) {
        console.error("import: category insert failed", error?.message);
        outcomes.push({ line, name: row.name, status: "failed", message: `Couldn't create the category "${row.category}"` });
        continue;
      }
      categoryId = created.id as number;
      categoryIds.set(row.category.toLowerCase(), categoryId);
    }

    const { data: inserted, error } = await supabase
      .from("pantry_items")
      .insert({
        name: row.name,
        category_id: categoryId,
        quantity: row.quantity,
        unit: row.unit,
        price: row.price,
        purchased_on: row.purchased_on,
        expires_on: row.expires_on,
        in_stock: row.quantity > 0,
      })
      .select("id")
      .single();
    if (error || !inserted) {
      console.error("import: item insert failed", error?.message);
      outcomes.push({ line, name: row.name, status: "failed", message: "Couldn't save this item" });
      continue;
    }
    itemIds.set(key, inserted.id as number); // a second row with the same name becomes a purchase
    outcomes.push({ line, name: row.name, status: "created", message: "Added to your pantry" });
  }

  revalidatePath("/", "layout");
  return { outcomes };
}
