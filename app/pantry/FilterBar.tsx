"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/app/components/ui/Button";
import { SORTS, type ItemFilters } from "@/lib/filters";
import type { Category } from "@/lib/pantry";

const select = "rounded-xl border border-lavender-300 bg-white px-3 py-2.5 text-base text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15";

// A plain GET form, so every choice ends up in the URL (?q=&category=&stock=&sort=).
// Dropdowns apply as soon as they change; search applies on Enter or "Search".
export default function FilterBar({ filters, categories }: { filters: ItemFilters; categories: Category[] }) {
  const submit = (e: React.ChangeEvent<HTMLSelectElement>) => e.currentTarget.form?.requestSubmit();
  const active = Boolean(filters.q || filters.category || filters.stock || filters.sort);

  return (
    <form action="/pantry" className="rounded-card border border-lavender-200/70 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search your shelves"
            aria-label="Search by name"
            className={`${select} w-full pl-10`}
          />
        </div>
        <select name="category" defaultValue={filters.category ?? ""} onChange={submit} aria-label="Category" className={select}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="stock" defaultValue={filters.stock ?? ""} onChange={submit} aria-label="Stock" className={select}>
          <option value="">In and out of stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select name="sort" defaultValue={filters.sort ?? "expiry"} onChange={submit} aria-label="Sort by" className={select}>
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              Sort: {label}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClass("primary")}>
          Search
        </button>
      </div>
      {active && (
        <div className="mt-3 text-right">
          <Link href="/pantry" className="text-sm font-bold text-plum hover:text-eggplant">
            Clear all filters
          </Link>
        </div>
      )}
    </form>
  );
}
