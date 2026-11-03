import { createClient } from "@/lib/supabase/server";
import type { ItemFilters } from "@/lib/filters";
import type { StatItem } from "@/lib/stats";

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
  stars: { item_id: number }[]; // RLS returns only my star, so non-empty means I starred it
};

export const isStarred = (item: PantryItem) => item.stars.length > 0;

const BASE_COLUMNS =
  "id, category_id, name, quantity, unit, price, purchased_on, expires_on, in_stock, created_at, categories(name)";
const ITEM_COLUMNS = `${BASE_COLUMNS}, stars(item_id)`;

// All queries use the logged-in user's session, so RLS returns only their rows.

export async function listItems(filters: ItemFilters = {}): Promise<PantryItem[]> {
  const supabase = await createClient();
  let query = supabase.from("pantry_items").select(ITEM_COLUMNS);

  if (filters.q) {
    // Escape LIKE wildcards so "50%" searches for the text "50%".
    const escaped = filters.q.replace(/[\\%_]/g, (c) => `\\${c}`);
    query = query.ilike("name", `%${escaped}%`);
  }
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.stock) query = query.eq("in_stock", filters.stock === "in");

  switch (filters.sort ?? "expiry") {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order("expires_on", { ascending: true, nullsFirst: false });
  }
  query = query.order("name");

  const { data, error } = await query;
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

// Starred items only (an inner join on stars). Out-of-stock first, since those need restocking.
export async function listStaples(): Promise<PantryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pantry_items")
    .select(`${BASE_COLUMNS}, stars!inner(item_id)`)
    .order("in_stock", { ascending: true })
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as PantryItem[];
}

// The few columns the dashboard needs, for all of my items.
export async function listStatItems(): Promise<StatItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pantry_items")
    .select("price, purchased_on, expires_on, in_stock, categories(name)");
  if (error) throw error;
  type Row = Omit<StatItem, "category"> & { categories: { name: string } | null };
  return ((data ?? []) as unknown as Row[]).map(({ categories, ...rest }) => ({
    ...rest,
    price: rest.price === null ? null : Number(rest.price),
    category: categories?.name ?? "Uncategorized",
  }));
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
