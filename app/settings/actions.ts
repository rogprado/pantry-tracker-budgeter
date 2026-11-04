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
  const { error } = await supabase.from("users").update({ monthly_budget: parsed.value }).eq("id", data.user.id);
  if (error) return { error: "We couldn't save your budget. Please try again.", value: raw };

  revalidatePath("/", "layout");
  return { saved: true, value: parsed.value === null ? "" : String(parsed.value) };
}
