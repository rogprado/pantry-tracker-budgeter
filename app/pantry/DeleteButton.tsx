"use client";

import { useState, useTransition } from "react";
import { deleteItem } from "@/app/pantry/actions";

// Asks "Are you sure?" before deleting.
export default function DeleteButton({ itemId, itemName }: { itemId: number; itemName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="font-semibold text-danger">
        Delete
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label="Confirm delete" className="rounded-xl bg-red-50 p-4">
      <p className="font-semibold">Are you sure?</p>
      <p className="mt-1 text-sm text-gray-600">&ldquo;{itemName}&rdquo; will be deleted for good.</p>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteItem(itemId))}
          className="rounded-xl bg-danger px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="btn-outline py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}
