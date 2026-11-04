"use server";

import { revalidatePath } from "next/cache";
import { parseBudget } from "@/lib/budget";
import { createClient } from "@/lib/supabase/server";

export type BudgetFormState = { error?: string; saved?: boolean; value?: string } | undefined;

export async function saveBudget(_prev: BudgetFormState, formData: FormData): Promise<BudgetFormState> {
  const raw = String(formData.get("monthly_budget") ?? "");
  const parsed = parseBudget(raw);
  if ("error" in parsed) return { error: parsed.error, value: raw };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Please log in again.", value: raw };

  // RLS + column permission: only my own row, only monthly_budget.
  // When RLS blocks an update, Postgres changes 0 rows without an error, so ask for the
  // changed row back and treat "no row" as a failure instead of showing "Saved".
  const { data: updated, error } = await supabase
    .from("users")
    .update({ monthly_budget: parsed.value })
    .eq("id", data.user.id)
    .select("monthly_budget");
  if (error || !updated?.length) {
    console.error("Budget update failed", error?.message ?? "no row updated (is the update policy migration applied?)");
    return { error: "We couldn't save your budget. Please try again.", value: raw };
  }

  revalidatePath("/", "layout");
  return { saved: true, value: parsed.value === null ? "" : String(parsed.value) };
}
