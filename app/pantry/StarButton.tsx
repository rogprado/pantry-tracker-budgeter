"use client";

import { Star } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { setStar } from "@/app/pantry/actions";

// Star toggle. Updates instantly, then saves; reverts if the save fails.
export default function StarButton({ itemId, starred }: { itemId: number; starred: boolean }) {
  const [shown, setShown] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={shown}
      aria-label={shown ? "Unstar (remove from staples)" : "Star as a staple"}
      title={shown ? "Remove from staples" : "Mark as a staple"}
      onClick={() =>
        startTransition(async () => {
          setShown(!shown);
          try {
            await setStar(itemId, !shown);
          } catch {
            // The optimistic star reverts on its own when the transition ends.
          }
        })
      }
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-lavender-200/70 ${shown ? "text-primary" : "text-lavender-300 hover:text-plum"}`}
    >
      <Star size={20} strokeWidth={2.25} fill={shown ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
