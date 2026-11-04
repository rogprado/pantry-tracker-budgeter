"use client";

import { CookingPot } from "lucide-react";
import { useState, useTransition } from "react";
import { recordMovement, undoMovement } from "@/app/pantry/actions";
import { showToast } from "@/app/components/Toaster";
import { Button } from "@/app/components/ui";
import { stepFor, tidy } from "@/lib/quantity";

export type CookItem = { id: number; name: string; quantity: number; unit: string | null; lastUsed: number | null };

// "I cooked this": tick what the recipe used and subtract it from the pantry in one go.
// Items named in the recipe are pre-ticked; amounts start at what you used last time.
export default function CookedThis({ recipeTitle, ingredients, items }: { recipeTitle: string; ingredients: string; items: CookItem[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const text = ingredients.toLowerCase();
  const [rows, setRows] = useState(() =>
    items.map((i) => ({
      ...i,
      checked: text.includes(i.name.toLowerCase()),
      amount: String(tidy(Math.min(i.lastUsed ?? stepFor(i.unit), i.quantity))),
    })),
  );

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} icon={<CookingPot size={16} aria-hidden="true" />}>
        I cooked this
      </Button>
    );
  }

  const chosen = rows.filter((r) => r.checked && Number(r.amount) > 0);

  const submit = () =>
    startTransition(async () => {
      const done: number[] = [];
      for (const r of chosen) {
        const result = await recordMovement(r.id, "use", Number(r.amount));
        if (result.ok) done.push(result.movementId);
      }
      setOpen(false);
      if (!done.length) {
        showToast("We couldn't update your pantry. Please try again.");
        return;
      }
      showToast(`Used ${done.length} ${done.length === 1 ? "item" : "items"} for ${recipeTitle}`, async () => {
        let ok = true;
        for (const id of [...done].reverse()) ok = (await undoMovement(id)).ok && ok;
        return ok;
      });
    });

  return (
    <div className="space-y-3 rounded-lg border border-lavender-200 bg-lavender p-4">
      <p className="text-sm font-medium text-ink">What did you use? Amounts start at what you used last time.</p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Nothing is in stock right now.</p>
      ) : (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto">
          {rows.map((r, n) => (
            <li key={r.id} className="flex items-center gap-3">
              <label className="flex flex-1 items-center gap-2 text-[15px]">
                <input
                  type="checkbox"
                  checked={r.checked}
                  onChange={(e) => setRows((all) => all.map((x, k) => (k === n ? { ...x, checked: e.target.checked } : x)))}
                  className="h-4 w-4 accent-primary"
                />
                {r.name}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={r.amount}
                disabled={!r.checked}
                onChange={(e) => setRows((all) => all.map((x, k) => (k === n ? { ...x, amount: e.target.value } : x)))}
                aria-label={`Amount of ${r.name} used`}
                className="w-20 rounded-md border border-lavender-300 bg-white px-2 py-1 text-right text-[15px] disabled:opacity-50"
              />
              <span className="w-14 text-sm text-muted">{r.unit ?? ""}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={pending || chosen.length === 0}>
          {pending ? "Updating…" : `Take ${chosen.length} from my pantry`}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
