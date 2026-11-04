"use client";

import { useActionState } from "react";
import { saveBudget } from "@/app/settings/actions";

export default function BudgetForm({ current }: { current: number | null }) {
  const [state, formAction, pending] = useActionState(saveBudget, undefined);
  const value = state?.value ?? (current === null ? "" : String(current));

  return (
    <form action={formAction} noValidate className="card space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Monthly grocery budget ($)</span>
        <input
          key={value}
          name="monthly_budget"
          inputMode="decimal"
          defaultValue={value}
          placeholder="e.g. 300"
          className={`input ${state?.error ? "border-danger" : ""}`}
          aria-invalid={state?.error ? true : undefined}
          aria-describedby="budget-help"
        />
        <span id="budget-help" className={`mt-1 block text-sm ${state?.error ? "text-danger" : "text-gray-500"}`}>
          {state?.error ?? "Leave blank for no budget."}
        </span>
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn">
          {pending ? "Saving…" : "Save budget"}
        </button>
        {state?.saved && !pending && <span className="text-sm font-semibold text-heading">Saved ✓</span>}
      </div>
    </form>
  );
}
