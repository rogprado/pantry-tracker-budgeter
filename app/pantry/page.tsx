import { Plus, Refrigerator, SearchX } from "lucide-react";
import { redirect } from "next/navigation";
import FilterBar from "@/app/pantry/FilterBar";
import { Shelves } from "@/app/pantry/ItemList";
import { ButtonLink, EmptyState, PageHeader } from "@/app/components/ui";
import { parseFilters } from "@/lib/filters";
import { listCategories, listItems } from "@/lib/pantry";
import { todayInTimeZone } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export default async function PantryPage({ searchParams }: PageProps<"/pantry">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const filters = parseFilters(await searchParams);
  const filtering = Boolean(filters.q || filters.category || filters.stock);
  const [items, categories] = await Promise.all([listItems(filters), listCategories()]);
  const today = todayInTimeZone();
  const inStock = items.filter((i) => i.in_stock).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pantry"
        title="What's in your kitchen?"
        subtitle={
          items.length > 0 && !filtering
            ? `${inStock} ${inStock === 1 ? "item" : "items"} on your shelves, sorted by shelf.`
            : "Everything on your shelves, in the fridge and in the freezer."
        }
        actions={
          <ButtonLink href="/pantry/new" icon={<Plus size={18} aria-hidden="true" />}>
            Add item
          </ButtonLink>
        }
      />

      {(items.length > 0 || filtering) && <FilterBar filters={filters} categories={categories} />}

      {items.length === 0 ? (
        filtering ? (
          <EmptyState
            icon={<SearchX size={26} aria-hidden="true" />}
            title="Nothing on these shelves"
            body="No items match these filters. Try a different search, or clear the filters to see everything."
            action={<ButtonLink href="/pantry" variant="secondary">Clear all filters</ButtonLink>}
          />
        ) : (
          <EmptyState
            icon={<Refrigerator size={26} aria-hidden="true" />}
            title="Your shelves are empty"
            body="Add what's in your fridge and cupboards, and we'll suggest recipes and keep track of what to use first."
            action={<ButtonLink href="/pantry/new" icon={<Plus size={18} aria-hidden="true" />}>Add your first item</ButtonLink>}
          />
        )
      ) : (
        <>
          {filtering && (
            <p className="text-sm font-semibold text-muted">
              {items.length} {items.length === 1 ? "item" : "items"} found
            </p>
          )}
          <Shelves items={items} today={today} />
        </>
      )}
    </div>
  );
}
