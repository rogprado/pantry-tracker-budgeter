"use client";

import { Check, PiggyBank } from "lucide-react";
import { useActionState } from "react";
import { Button, Field, Input } from "@/app/components/ui";
import { saveBudget } from "@/app/settings/actions";

export default function BudgetForm({ current }: { current: number | null }) {
  const [state, formAction, pending] = useActionState(saveBudget, undefined);
  const value = state?.value ?? (current === null ? "" : String(current));

  return (
    <form action={formAction} noValidate className="space-y-5 rounded-card border border-lavender-200/70 bg-white p-8 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lavender-200/70 text-plum">
          <PiggyBank size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-eggplant">Monthly grocery budget</h2>
          <p className="text-sm text-muted">We use it for the budget bar and to keep your shopping list in check.</p>
        </div>
      </div>
      <Field label="Amount per month ($)" error={state?.error} help="Leave blank for no budget.">
        <Input
          key={value}
          name="monthly_budget"
          inputMode="decimal"
          defaultValue={value}
          placeholder="e.g. 300"
          invalid={Boolean(state?.error)}
          className="max-w-xs"
        />
      </Field>
      <div className="flex items-center gap-3 border-t border-lavender-200 pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save budget"}
        </Button>
        {state?.saved && !pending && (
          <span className="flex items-center gap-1.5 text-base font-bold text-fresh-ink" role="status">
            <Check size={18} aria-hidden="true" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
