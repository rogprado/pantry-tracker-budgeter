"use client";

import { Minus, Plus } from "lucide-react";
import { useTransition } from "react";
import { recordMovement, undoMovement } from "@/app/pantry/actions";
import { showToast } from "@/app/components/Toaster";
import { formatAmount, halfOf, stepFor } from "@/lib/quantity";

type Props = { itemId: number; name: string; quantity: number; unit: string | null };

const small =
  "rounded-md border border-lavender-300 bg-white px-2 py-1 text-sm font-medium text-ink transition hover:bg-lavender disabled:cursor-not-allowed disabled:opacity-40";
const round =
  "grid h-8 w-8 place-items-center rounded-md border border-lavender-300 bg-white text-ink transition hover:bg-lavender disabled:cursor-not-allowed disabled:opacity-40";

// − / + by a sensible step for the unit, plus "Used half" and "Used all", right on the pantry row.
// Each press logs a use or purchase movement; the toast offers Undo.
export default function QuickControls({ itemId, name, quantity, unit }: Props) {
  const [pending, startTransition] = useTransition();
  const step = stepFor(unit);
  const empty = quantity <= 0;

  const change = (kind: "use" | "purchase", amount: number, label: string) =>
    startTransition(async () => {
      const result = await recordMovement(itemId, kind, amount);
      if (!result.ok) {
        showToast(result.error);
        return;
      }
      showToast(`${label} · ${name}`, async () => (await undoMovement(result.movementId)).ok);
    });

  return (
    <div className="flex flex-wrap items-center justify-end gap-2" aria-busy={pending}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={round}
          disabled={pending || empty}
          onClick={() => change("use", step, `Used ${formatAmount(Math.min(step, quantity), unit)}`)}
          aria-label={`Use ${formatAmount(step, unit)} of ${name}`}
          title={`Use ${formatAmount(step, unit)}`}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <span className="font-display min-w-[4.5rem] text-center text-xl text-eggplant tabular-nums" aria-label={`Quantity: ${formatAmount(quantity, unit)}`}>
          {formatAmount(quantity, unit)}
        </span>
        <button
          type="button"
          className={round}
          disabled={pending}
          onClick={() => change("purchase", step, `Added ${formatAmount(step, unit)}`)}
          aria-label={`Add ${formatAmount(step, unit)} of ${name}`}
          title={`Add ${formatAmount(step, unit)}`}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        className={small}
        disabled={pending || empty}
        onClick={() => change("use", halfOf(quantity), `Used half (${formatAmount(halfOf(quantity), unit)})`)}
      >
        Used half
      </button>
      <button
        type="button"
        className={small}
        disabled={pending || empty}
        onClick={() => change("use", quantity, "Used it all, marked out of stock")}
      >
        Used all
      </button>
    </div>
  );
}
