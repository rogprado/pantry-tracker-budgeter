"use client";

import Link from "next/link";
import { buttonClass } from "@/app/components/ui/Button";
import { useActionState, useState, type FormEvent } from "react";
import type { Category, PantryItem } from "@/lib/pantry";
import type { ItemFormState } from "@/app/pantry/actions";
import {
  NEW_CATEGORY,
  readItemForm,
  validateItem,
  type FieldErrors,
  type ItemField,
  type ItemFormValues,
} from "@/lib/validation";

type Props = {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  categories: Category[];
  item?: PantryItem;
  cancelHref: string;
};

function valuesFromItem(item?: PantryItem): Partial<ItemFormValues> {
  if (!item) return { in_stock: true };
  return {
    name: item.name,
    category_id: String(item.category_id),
    quantity: String(item.quantity),
    unit: item.unit ?? "",
    price: item.price === null ? "" : String(item.price),
    purchased_on: item.purchased_on ?? "",
    expires_on: item.expires_on ?? "",
    in_stock: item.in_stock,
  };
}

function FieldError({ field, errors }: { field: ItemField; errors: FieldErrors }) {
  if (!errors[field]) return null;
  return (
    <p id={`${field}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-expired-ink">
      <span aria-hidden="true">⚠</span>
      {errors[field]}
    </p>
  );
}

export default function ItemForm({ action, categories, item, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // Errors found in the browser before sending; null once the form passes and is sent.
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);

  // After a server round trip, refill the form with what was typed.
  const v = state?.values ?? valuesFromItem(item);
  const errors = clientErrors ?? state?.fieldErrors ?? {};

  const [categoryChoice, setCategoryChoice] = useState(
    v.category_id ?? (categories.length ? "" : NEW_CATEGORY),
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const found = validateItem(readItemForm(new FormData(e.currentTarget)));
    if (Object.keys(found).length > 0) {
      e.preventDefault(); // keep the user's input, show messages, don't send
      setClientErrors(found);
    } else {
      setClientErrors(null);
    }
  }

  const invalid = (field: ItemField) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {};
  const inputClass = (field: ItemField) => `input ${errors[field] ? "!border-expired-ink/60" : ""}`;

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-5 rounded-card border border-lavender-200 bg-white p-8">
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-lg bg-expired-soft px-4 py-3 text-sm font-semibold text-expired-ink">
          Almost there. Please fix the fields marked below.
        </p>
      )}
      {state?.error && (
        <p role="alert" className="rounded-lg bg-expired-soft px-4 py-3 text-sm font-semibold text-expired-ink">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="text-sm font-semibold text-ink">Name</span>
        <input
          name="name"
          defaultValue={v.name}
          className={inputClass("name")}
          placeholder="e.g. Brown rice"
          {...invalid("name")}
        />
        <FieldError field="name" errors={errors} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Category</span>
        <select
          name="category_id"
          value={categoryChoice}
          onChange={(e) => setCategoryChoice(e.target.value)}
          className={inputClass("category")}
          {...invalid("category")}
        >
          <option value="">Choose a category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ New category</option>
        </select>
        {categoryChoice === NEW_CATEGORY && (
          <input
            name="new_category"
            defaultValue={v.new_category}
            className={inputClass("category")}
            placeholder="New category name, e.g. Grains"
            aria-label="New category name"
          />
        )}
        <FieldError field="category" errors={errors} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Quantity</span>
          <input
            name="quantity"
            type="number"
            step="any"
            min="0"
            defaultValue={v.quantity}
            className={inputClass("quantity")}
            {...invalid("quantity")}
          />
          <FieldError field="quantity" errors={errors} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Unit</span>
          <input name="unit" defaultValue={v.unit} className="input" placeholder="e.g. kg, cans" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-ink">
          Price ($) <span className="font-normal text-muted">optional</span>
        </span>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={v.price}
          className={inputClass("price")}
          {...invalid("price")}
        />
        <FieldError field="price" errors={errors} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Purchased on</span>
          <input name="purchased_on" type="date" defaultValue={v.purchased_on} className="input" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Expires on</span>
          <input name="expires_on" type="date" defaultValue={v.expires_on} className="input" />
        </label>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-lg bg-lavender px-4 py-3">
        <input
          name="in_stock"
          type="checkbox"
          defaultChecked={v.in_stock}
          className="h-5 w-5 accent-primary"
        />
        <span className="text-sm font-semibold text-ink">In stock</span>
      </label>

      <div className="flex gap-3 border-t border-lavender-200 pt-5">
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          {pending ? "Saving…" : item ? "Save changes" : "Add item"}
        </button>
        <Link href={cancelHref} className={buttonClass("secondary")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
