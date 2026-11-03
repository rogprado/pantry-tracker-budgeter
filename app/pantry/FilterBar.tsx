"use client";

import Link from "next/link";
import type { Category } from "@/lib/pantry";
import { SORTS, type ItemFilters } from "@/lib/filters";

// A plain GET form, so every choice ends up in the URL (?q=&category=&stock=&sort=).
// Dropdowns apply as soon as they change; search applies on Enter or "Search".
export default function FilterBar({ filters, categories }: { filters: ItemFilters; categories: Category[] }) {
  const submit = (e: React.ChangeEvent<HTMLSelectElement>) => e.currentTarget.form?.requestSubmit();
  const active = Boolean(filters.q || filters.category || filters.stock || filters.sort);

  return (
    <form action="/pantry" className="card grid gap-3 p-4 sm:grid-cols-2">
      <div className="flex gap-2 sm:col-span-2">
        <input
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Search by name"
          aria-label="Search by name"
          className="input mt-0"
        />
        <button type="submit" className="btn">
          Search
        </button>
      </div>

      <select name="category" defaultValue={filters.category ?? ""} onChange={submit} aria-label="Category" className="input mt-0">
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select name="stock" defaultValue={filters.stock ?? ""} onChange={submit} aria-label="Stock" className="input mt-0">
        <option value="">In and out of stock</option>
        <option value="in">In stock</option>
        <option value="out">Out of stock</option>
      </select>

      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <span className="font-semibold">Sort by</span>
        <select name="sort" defaultValue={filters.sort ?? "expiry"} onChange={submit} className="input mt-0 w-auto">
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {active && (
          <Link href="/pantry" className="ml-auto font-semibold text-primary">
            Clear all
          </Link>
        )}
      </label>
    </form>
  );
}
