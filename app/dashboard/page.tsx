import { CalendarClock, ChartColumn, Package, Refrigerator, Wallet } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import produceOnWhite from "@/public/images/produce-on-white.jpg";
import BudgetBar from "@/app/components/BudgetBar";
import { ButtonLink, Card, CardTitle, CategoryIcon, EmptyState, FreshnessPill, PageHeader, StatCard } from "@/app/components/ui";
import PeriodFilter from "@/app/dashboard/PeriodFilter";
import SpendingChart from "@/app/dashboard/SpendingChart";
import SpendingOverTime from "@/app/dashboard/SpendingOverTime";
import { itemsToUseSoon } from "@/lib/freshness";
import { formatQuantity, listItems, listStatItems } from "@/lib/pantry";
import {
  availableMonths,
  availableYears,
  defaultGrouping,
  expiringSoon,
  itemsInStock,
  monthName,
  parsePeriod,
  periodLabel,
  spendingByCategory,
  spendingOverTime,
  spentInPeriod,
  spentThisMonth,
  todayInTimeZone,
} from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const [items, inStockItems, profile] = await Promise.all([
    listStatItems(),
    listItems({ stock: "in", sort: "expiry" }),
    supabase.from("users").select("monthly_budget").eq("id", data.user.id).maybeSingle(),
  ]);
  const monthlyBudget = profile.data?.monthly_budget == null ? null : Number(profile.data.monthly_budget);
  const today = todayInTimeZone();
  const month = monthName(today.slice(0, 7)).split(" ")[0];
  const period = parsePeriod(await searchParams, today);
  const label = periodLabel(period);
  const byCategory = spendingByCategory(items, period);
  const soon = itemsToUseSoon(inStockItems, today);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="How's your kitchen?"
        subtitle="What to use up first, what you have, and where the grocery money went."
        image={produceOnWhite}
        imageAlt="Strawberries, grapefruit and rhubarb on a white counter"
      />

      {/* Use it soon: the card to look at first */}
      <Card tone="highlight">
        <CardTitle
          icon={<CalendarClock size={20} aria-hidden="true" />}
          title="Use it soon"
          sub={soon.length ? "Expired or expiring in the next 7 days, soonest first." : undefined}
          action={soon.length > 0 && <ButtonLink href="/recipes" size="sm">Get recipe ideas</ButtonLink>}
        />
        {soon.length === 0 ? (
          <p className="text-base text-muted">Nothing needs using up this week. Your shelves are in good shape.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {soon.slice(0, 6).map((i) => (
              <li key={i.id}>
                <Link href={`/pantry/${i.id}`} className="flex items-center gap-3 rounded-xl bg-white/80 p-3 transition hover:bg-white hover:shadow-card">
                  <CategoryIcon name={i.categories?.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-ink">{i.name}</span>
                    <span className="block text-sm text-muted">{formatQuantity(i)}</span>
                  </span>
                  <FreshnessPill expiresOn={i.expires_on} today={today} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {soon.length > 6 && <p className="mt-3 text-sm text-muted">And {soon.length - 6} more on your pantry page.</p>}
      </Card>

      {/* Always this month, whatever period is picked below. */}
      <BudgetBar spent={spentThisMonth(items, today)} budget={monthlyBudget} month={month} />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard icon={<Wallet size={18} aria-hidden="true" />} label={`Spent · ${label}`} value={`$${spentInPeriod(items, period).toFixed(2)}`} />
        <StatCard icon={<Refrigerator size={18} aria-hidden="true" />} label="In stock now" value={String(itemsInStock(items))} hint="Items on your shelves" href="/pantry?stock=in" />
        <StatCard icon={<CalendarClock size={18} aria-hidden="true" />} label="Expiring in 7 days" value={String(expiringSoon(items, today))} hint="Not counting already expired" href="/pantry?stock=in&sort=expiry" />
      </div>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-eggplant">Where the money went</h2>
            <p className="text-base text-muted">Showing {label}.</p>
          </div>
        </div>
        <PeriodFilter period={period} currentMonth={today.slice(0, 7)} months={availableMonths(items, today)} years={availableYears(items, today)} />

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardTitle icon={<ChartColumn size={20} aria-hidden="true" />} title="By category" sub={label} />
            {byCategory.length === 0 ? (
              <EmptyState
                compact
                icon={<Package size={24} aria-hidden="true" />}
                title="No spending yet"
                body="Add a price and purchase date when you add groceries, and they'll show up here."
              />
            ) : (
              <SpendingChart data={byCategory} />
            )}
          </Card>
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
      </section>
    </div>
  );
}
