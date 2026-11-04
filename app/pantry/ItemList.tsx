import { ChevronRight } from "lucide-react";
import Link from "next/link";
import QuickControls from "@/app/pantry/QuickControls";
import StarButton from "@/app/pantry/StarButton";
import { CategoryIcon, FreshnessPill, StatusPill } from "@/app/components/ui";
import { isStarred, type PantryItem } from "@/lib/pantry";

// One item: star, name, the quantity big and clear, and a freshness pill.
// Out-of-stock items are faded and labelled, not hidden.
export function ItemRow({ item, today, showCategory = false, fade = true }: { item: PantryItem; today: string; showCategory?: boolean; fade?: boolean }) {
  const faded = !item.in_stock && fade ? "opacity-60" : "";
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1.5 pr-3 pl-2">
      <div className={`flex min-w-[220px] flex-1 items-center gap-2 ${faded}`}>
        <StarButton itemId={item.id} starred={isStarred(item)} />
        <Link
          href={`/pantry/${item.id}`}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-lavender"
        >
          {showCategory && <CategoryIcon name={item.categories?.name} size="sm" />}
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-base font-semibold text-ink">{item.name}</span>
              {!item.in_stock && <StatusPill tone="neutral">Out of stock</StatusPill>}
              {item.in_stock && <FreshnessPill expiresOn={item.expires_on} today={today} />}
            </span>
            {showCategory && <span className="block text-sm text-muted">{item.categories?.name}</span>}
          </span>
          <ChevronRight size={18} className="shrink-0 text-lavender-300 transition group-hover:text-plum" aria-hidden="true" />
        </Link>
      </div>
      {/* Quick updates without opening the item */}
      <QuickControls itemId={item.id} name={item.name} quantity={Number(item.quantity)} unit={item.unit} />
    </li>
  );
}

// Items grouped by category like shelves. Inside each shelf, the chosen sort order is kept.
export function Shelves({ items, today }: { items: PantryItem[]; today: string }) {
  const shelves = new Map<string, PantryItem[]>();
  for (const item of items) {
    const name = item.categories?.name ?? "Other";
    shelves.set(name, [...(shelves.get(name) ?? []), item]);
  }
  const ordered = [...shelves].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="grid gap-5">
      {ordered.map(([name, shelfItems]) => (
        <section key={name} className="rounded-card border border-lavender-200 bg-white">
          <header className="flex items-center gap-3 border-b border-lavender-200 px-5 py-4">
            <CategoryIcon name={name} />
            <h2 className="font-display flex-1 text-xl font-medium text-eggplant">{name}</h2>
            <span className="text-sm font-semibold text-muted">
              {shelfItems.length} {shelfItems.length === 1 ? "item" : "items"}
            </span>
          </header>
          <ul className="divide-y divide-lavender-200/70 px-1 py-1">
            {shelfItems.map((item) => (
              <ItemRow key={item.id} item={item} today={today} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
