// Search, filter and sort options for /pantry. No server code, so the browser can use it too.

export const SORTS = { expiry: "Expiry date", newest: "Newest", price: "Price" } as const;
export type Sort = keyof typeof SORTS;

export type ItemFilters = {
  q?: string; // name contains
  category?: number;
  stock?: "in" | "out";
  sort?: Sort;
};

// Reads ?q=&category=&stock=&sort= from the URL, ignoring anything unexpected.
export function parseFilters(params: Record<string, string | string[] | undefined>): ItemFilters {
  const one = (key: string) => {
    const v = params[key];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const category = Number(one("category"));
  const stock = one("stock");
  const sort = one("sort");
  return {
    q: one("q"),
    category: Number.isInteger(category) && category > 0 ? category : undefined,
    stock: stock === "in" || stock === "out" ? stock : undefined,
    sort: sort && sort in SORTS ? (sort as Sort) : undefined,
  };
}
