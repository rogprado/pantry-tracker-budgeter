import { createClient } from "@/lib/supabase/server";

export type Category = { id: number; name: string };

export type PantryItem = {
  id: number;
  category_id: number;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  purchased_on: string | null;
  expires_on: string | null;
  in_stock: boolean;
  created_at: string;
  categories: { name: string } | null;
};

const ITEM_COLUMNS =
  "id, category_id, name, quantity, unit, price, purchased_on, expires_on, in_stock, created_at, categories(name)";

// All queries use the logged-in user's session, so RLS returns only their rows.

export async function listItems(): Promise<PantryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pantry_items")
    .select(ITEM_COLUMNS)
    .order("expires_on", { ascending: true, nullsFirst: false })
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as PantryItem[];
}

export async function getItem(id: number): Promise<PantryItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pantry_items")
    .select(ITEM_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as PantryItem | null;
}

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatQuantity(item: Pick<PantryItem, "quantity" | "unit">): string {
  return item.unit ? `${item.quantity} ${item.unit}` : String(item.quantity);
}
