import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FilterBar from "@/app/pantry/FilterBar";
import ItemList from "@/app/pantry/ItemList";
import { parseFilters } from "@/lib/filters";
import { listCategories, listItems } from "@/lib/pantry";

export default async function PantryPage({ searchParams }: PageProps<"/pantry">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const filters = parseFilters(await searchParams);
  const filtering = Boolean(filters.q || filters.category || filters.stock);
  const [items, categories] = await Promise.all([listItems(filters), listCategories()]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">Your pantry</h1>
        <Link href="/pantry/new" className="btn">
          Add item
        </Link>
      </div>

      {(items.length > 0 || filtering) && <FilterBar filters={filters} categories={categories} />}

      {items.length === 0 ? (
        <div className="card text-gray-600">
          {filtering ? (
            <>
              No items match these filters.{" "}
              <Link href="/pantry" className="font-semibold text-primary">Clear all</Link>
            </>
          ) : (
            "Your pantry is empty. Add your first item to get started."
          )}
        </div>
      ) : (
        <>
          {filtering && (
            <p className="text-sm text-gray-600">
              {items.length} {items.length === 1 ? "item" : "items"} found
            </p>
          )}
          <ItemList items={items} />
        </>
      )}
    </div>
  );
}
