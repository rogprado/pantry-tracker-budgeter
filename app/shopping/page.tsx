import { redirect } from "next/navigation";
import BudgetBar from "@/app/components/BudgetBar";
import ShoppingList, { type BudgetInfo } from "@/app/shopping/ShoppingList";
import { PageHeader } from "@/app/components/ui";
import marketProduce from "@/public/images/market-produce.jpg";
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
    .map((s) => ({ id: s.id, name: s.name, price: s.price === null ? null : Number(s.price), category: s.categories?.name ?? "Other" }));

  const monthly = profile.data?.monthly_budget;
  const spentNow = spentThisMonth(statItems, today);
  const monthLabel = monthName(today.slice(0, 7)).split(" ")[0];
  let budget: BudgetInfo = null;
  if (monthly !== null && monthly !== undefined) {
    budget = {
      monthly: Number(monthly),
      spent: spentNow,
      remaining: Math.round((Number(monthly) - spentNow) * 100) / 100,
      month: monthLabel,
    };
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Shopping"
        title="Your shopping list"
        subtitle="Restock your staples, add a few smart buys, and stay inside your budget."
        image={marketProduce}
        imageAlt="Fresh tomatoes and carrots at a market stall"
      />
      <BudgetBar spent={spentNow} budget={budget ? budget.monthly : null} month={monthLabel} />
      <ShoppingList staples={toRestock} budget={budget} />
    </div>
  );
}
