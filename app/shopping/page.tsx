import { redirect } from "next/navigation";
import ShoppingList, { type BudgetInfo } from "@/app/shopping/ShoppingList";
import { listStaples, listStatItems } from "@/lib/pantry";
import { monthName, spentThisMonth, todayInTimeZone } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export default async function ShoppingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const today = todayInTimeZone();
  const [staples, statItems, profile] = await Promise.all([
    listStaples(),
    listStatItems(),
    supabase.from("users").select("monthly_budget").eq("id", data.user.id).maybeSingle(),
  ]);

  const toRestock = staples
    .filter((s) => !s.in_stock)
    .map((s) => ({ id: s.id, name: s.name, price: s.price === null ? null : Number(s.price) }));

  const monthly = profile.data?.monthly_budget;
  let budget: BudgetInfo = null;
  if (monthly !== null && monthly !== undefined) {
    const spent = spentThisMonth(statItems, today);
    budget = {
      monthly: Number(monthly),
      spent,
      remaining: Math.round((Number(monthly) - spent) * 100) / 100,
      month: monthName(today.slice(0, 7)).split(" ")[0],
    };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">Shopping list</h1>
      <ShoppingList staples={toRestock} budget={budget} />
    </div>
  );
}
