import { redirect } from "next/navigation";
import BudgetBar from "@/app/components/BudgetBar";
import BudgetForm from "@/app/settings/BudgetForm";
import { listStatItems } from "@/lib/pantry";
import { monthName, spentThisMonth, todayInTimeZone } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const today = todayInTimeZone();
  const [profile, items] = await Promise.all([
    supabase.from("users").select("monthly_budget").eq("id", data.user.id).maybeSingle(),
    listStatItems(),
  ]);
  const budget = profile.data?.monthly_budget == null ? null : Number(profile.data.monthly_budget);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">Settings</h1>
      <BudgetForm current={budget} />
      {budget !== null && (
        <BudgetBar spent={spentThisMonth(items, today)} budget={budget} month={monthName(today.slice(0, 7)).split(" ")[0]} />
      )}
    </div>
  );
}
