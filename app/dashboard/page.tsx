import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SpendingChart from "@/app/dashboard/SpendingChart";
import SpendingOverTime from "@/app/dashboard/SpendingOverTime";
import { listStatItems } from "@/lib/pantry";
import {
  expiringSoon,
  itemsInStock,
  spendingByCategory,
  spendingByDay,
  spendingByWeek,
  spentThisMonth,
  todayInTimeZone,
} from "@/lib/stats";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const items = await listStatItems();
  const today = todayInTimeZone();
  const month = new Date(`${today}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const byCategory = spendingByCategory(items, today);

  const stats = [
    { label: `Spent in ${month}`, value: `$${spentThisMonth(items, today).toFixed(2)}`, href: undefined },
    { label: "Items in stock", value: String(itemsInStock(items)), href: "/pantry?stock=in" },
    { label: "Expiring in the next 7 days", value: String(expiringSoon(items, today)), href: "/pantry?stock=in&sort=expiry" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">Dashboard</h1>

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
        <h2 className="font-bold text-heading">Spending by category in {month}</h2>
        {byCategory.length === 0 ? (
          <p className="mt-2 text-gray-600">
            No priced items bought in {month} yet. Add a price and purchase date to an item to see it here.
          </p>
        ) : (
          <div className="mt-4">
            <SpendingChart data={byCategory} />
          </div>
        )}
      </section>

      <SpendingOverTime byDay={spendingByDay(items, today)} byWeek={spendingByWeek(items, today)} month={month} />
    </div>
  );
}
