"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteItem } from "@/app/pantry/actions";
import { buttonClass } from "@/app/components/ui/Button";

// Asks "Are you sure?" before deleting.
export default function DeleteButton({ itemId, itemName }: { itemId: number; itemName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={buttonClass("ghost", "md", "!text-expired-ink hover:!bg-expired-soft")}>
        <Trash2 size={18} aria-hidden="true" />
        Delete
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label="Confirm delete" className="w-full rounded-lg border border-expired/30 bg-expired-soft p-5">
      <p className="font-display text-xl font-medium text-expired-ink">Are you sure?</p>
      <p className="mt-1 text-base text-ink">&ldquo;{itemName}&rdquo; will be deleted for good.</p>
      <div className="mt-4 flex gap-3">
        <button type="button" disabled={pending} onClick={() => startTransition(() => deleteItem(itemId))} className={buttonClass("danger")}>
          <Trash2 size={18} aria-hidden="true" />
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className={buttonClass("secondary")}>
          Cancel
        </button>
      </div>
    </div>
  );
}
