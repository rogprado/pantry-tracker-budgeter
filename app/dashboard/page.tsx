import Link from "next/link";
import { redirect } from "next/navigation";
import BudgetBar from "@/app/components/BudgetBar";
import { createClient } from "@/lib/supabase/server";
import PeriodFilter from "@/app/dashboard/PeriodFilter";
import SpendingChart from "@/app/dashboard/SpendingChart";
import SpendingOverTime from "@/app/dashboard/SpendingOverTime";
import { listStatItems } from "@/lib/pantry";
import {
  availableMonths,
  availableYears,
  defaultGrouping,
  expiringSoon,
  itemsInStock,
  parsePeriod,
  periodLabel,
  spendingByCategory,
  spendingOverTime,
  spentInPeriod,
  monthName,
  spentThisMonth,
  todayInTimeZone,
} from "@/lib/stats";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const [items, profile] = await Promise.all([
    listStatItems(),
    supabase.from("users").select("monthly_budget").eq("id", data.user.id).maybeSingle(),
  ]);
  const monthlyBudget = profile.data?.monthly_budget == null ? null : Number(profile.data.monthly_budget);
  const today = todayInTimeZone();
  const period = parsePeriod(await searchParams, today);
  const label = periodLabel(period);
  const byCategory = spendingByCategory(items, period);

  const stats = [
    { label: `Spent · ${label}`, value: `$${spentInPeriod(items, period).toFixed(2)}`, href: undefined },
    { label: "Items in stock now", value: String(itemsInStock(items)), href: "/pantry?stock=in" },
    { label: "Expiring in the next 7 days", value: String(expiringSoon(items, today)), href: "/pantry?stock=in&sort=expiry" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">Dashboard</h1>

      {/* Always this month, whatever period is picked below. */}
      <BudgetBar
        spent={spentThisMonth(items, today)}
        budget={monthlyBudget}
        month={monthName(today.slice(0, 7)).split(" ")[0]}
      />

      <PeriodFilter
        period={period}
        currentMonth={today.slice(0, 7)}
        months={availableMonths(items, today)}
        years={availableYears(items, today)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const body = (
            <>
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className="mt-1 text-3xl font-extrabold text-heading">{s.value}</p>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="card block hover:ring-2 hover:ring-primary/20">
              {body}
            </Link>
          ) : (
            <div key={s.label} className="card">
              {body}
            </div>
          );
        })}
      </div>

      <section className="card">
        <h2 className="font-bold text-heading">Spending by category · {label}</h2>
        {byCategory.length === 0 ? (
          <p className="mt-2 text-gray-600">
            No priced items bought in this period. Add a price and purchase date to an item to see it here.
          </p>
        ) : (
          <div className="mt-4">
            <SpendingChart data={byCategory} />
          </div>
        )}
      </section>

      <SpendingOverTime
        series={{
          day: spendingOverTime(items, period, today, "day"),
          week: spendingOverTime(items, period, today, "week"),
          month: spendingOverTime(items, period, today, "month"),
        }}
        initialGrouping={defaultGrouping(period)}
        periodLabel={label}
      />
    </div>
  );
}
