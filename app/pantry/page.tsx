import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import FilterBar from "@/app/pantry/FilterBar";
import ItemList from "@/app/pantry/ItemList";
import { parseFilters, type ItemFilters } from "@/lib/filters";
import { listCategories, listItems } from "@/lib/pantry";

export default async function PantryPage({ searchParams }: PageProps<"/pantry">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const filters = parseFilters(await searchParams);
  const categories = await listCategories();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">Your pantry</h1>
        <Link href="/pantry/new" className="btn">
          Add item
        </Link>
      </div>

      {/* No categories means no items yet, so there's nothing to filter. */}
      {/* key: refill the inputs from the URL after "Clear all" or the back button. */}
      {categories.length > 0 && (
        <FilterBar key={JSON.stringify(filters)} filters={filters} categories={categories} />
      )}

      {/* Only this part waits for the new results; the header and filters stay put. */}
      <Suspense key={JSON.stringify(filters)} fallback={<div className="card text-gray-500">Searching…</div>}>
        <Results filters={filters} />
      </Suspense>
    </div>
  );
}

async function Results({ filters }: { filters: ItemFilters }) {
  const items = await listItems(filters);
  const filtering = Boolean(filters.q || filters.category || filters.stock);

  if (items.length === 0) {
    return (
      <div className="card text-gray-600">
        {filtering ? (
          <>
            No items match these filters.{" "}
            <Link href="/pantry" scroll={false} className="font-semibold text-primary">
              Clear all
            </Link>
          </>
        ) : (
          "Your pantry is empty. Add your first item to get started."
        )}
      </div>
    );
  }

  return (
    <>
      {filtering && (
        <p className="text-sm text-gray-600">
          {items.length} {items.length === 1 ? "item" : "items"} found
        </p>
      )}
      <ItemList items={items} />
    </>
  );
}
