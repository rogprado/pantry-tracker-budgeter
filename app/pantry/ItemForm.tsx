"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Category, PantryItem } from "@/lib/pantry";
import type { ItemFormState } from "@/app/pantry/actions";

type Props = {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  categories: Category[];
  item?: PantryItem;
  cancelHref: string;
};

export default function ItemForm({ action, categories, item, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [categoryChoice, setCategoryChoice] = useState(
    item ? String(item.category_id) : categories.length ? "" : "new",
  );

  return (
    <form action={formAction} noValidate className="card space-y-4">
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="text-sm font-semibold">Name</span>
        <input name="name" defaultValue={item?.name} className="input" placeholder="e.g. Brown rice" />
      </label>

      <label className="block">
        <span className="text-sm font-semibold">Category</span>
        <select
          name="category_id"
          value={categoryChoice}
          onChange={(e) => setCategoryChoice(e.target.value)}
          className="input"
        >
          <option value="">Choose a category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="new">+ New category</option>
        </select>
      </label>

      {categoryChoice === "new" && (
        <label className="block">
          <span className="text-sm font-semibold">New category name</span>
          <input name="new_category" className="input" placeholder="e.g. Grains" />
        </label>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold">Quantity</span>
          <input
            name="quantity"
            type="number"
            step="any"
            min="0"
            defaultValue={item?.quantity}
            className="input"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Unit</span>
          <input name="unit" defaultValue={item?.unit ?? ""} className="input" placeholder="e.g. kg, cans" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold">Price ($)</span>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={item?.price ?? ""}
          className="input"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold">Purchased on</span>
          <input name="purchased_on" type="date" defaultValue={item?.purchased_on ?? ""} className="input" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Expires on</span>
          <input name="expires_on" type="date" defaultValue={item?.expires_on ?? ""} className="input" />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          name="in_stock"
          type="checkbox"
          defaultChecked={item ? item.in_stock : true}
          className="h-4 w-4 accent-primary"
        />
        <span className="text-sm font-semibold">In stock</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn">
          {pending ? "Saving…" : item ? "Save changes" : "Add item"}
        </button>
        <Link href={cancelHref} className="btn-outline py-2">
          Cancel
        </Link>
      </div>
    </form>
  );
}
