// Dashboard calculations. Pure functions: no database, no clock.
// "today" is always passed in as a "YYYY-MM-DD" string, so tests can pick any date.

export type StatItem = {
  price: number | null;
  purchased_on: string | null; // "YYYY-MM-DD"
  expires_on: string | null; // "YYYY-MM-DD"
  in_stock: boolean;
  category: string;
};

export type CategorySpend = { category: string; total: number };
export type PeriodSpend = { label: string; start: string; end: string; total: number };

// Which purchases the spending numbers cover.
export type Period =
  | { kind: "months"; months: string[] } // "YYYY-MM", oldest first, at least one
  | { kind: "year"; year: number }
  | { kind: "all" };

export type Grouping = "day" | "week" | "month";

// The app's home time zone, so "today" and "this month" match the kitchen, not the server (UTC).
export const TIME_ZONE = "America/Los_Angeles";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ---------- dates ----------

// Today's date in TIME_ZONE as "YYYY-MM-DD". The only function here that reads the clock.
export function todayInTimeZone(now: Date = new Date(), timeZone = TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

// "2026-11-03" plus 7 days -> "2026-11-10". Works on the calendar date, so no time-zone drift.
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Monday of the week that contains date.
export function weekStart(date: string): string {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(date, -((day + 6) % 7));
}

const monthOf = (date: string) => date.slice(0, 7);
const nextMonth = (month: string) => monthOf(addDays(`${month}-28`, 7));
const roundCents = (n: number) => Math.round(n * 100) / 100;
const shortDate = (date: string) => `${MONTHS[Number(date.slice(5, 7)) - 1]} ${Number(date.slice(8, 10))}`;
export const monthName = (month: string) => `${FULL_MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;

// Every month from first to last, inclusive ("YYYY-MM").
function monthRange(first: string, last: string): string[] {
  const out: string[] = [];
  for (let m = first; m <= last; m = nextMonth(m)) out.push(m);
  return out;
}

// ---------- periods ----------

export const currentMonthPeriod = (today: string): Period => ({ kind: "months", months: [monthOf(today)] });

// Reads ?period=this, ?period=months&m=2026-10&m=2026-11, ?period=year&year=2026 or ?period=all.
// Anything missing or invalid falls back to the current month.
export function parsePeriod(params: Record<string, string | string[] | undefined>, today: string): Period {
  const list = (key: string) => [params[key] ?? []].flat();
  const kind = list("period")[0];

  if (kind === "this") return currentMonthPeriod(today);
  if (kind === "all") return { kind: "all" };
  if (kind === "year") {
    const year = Number(list("year")[0]);
    return { kind: "year", year: Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : Number(today.slice(0, 4)) };
  }
  const months = [...new Set(list("m").filter((m) => /^\d{4}-(0[1-9]|1[0-2])$/.test(m)))].sort();
  return months.length ? { kind: "months", months } : currentMonthPeriod(today);
}

// "November 2026", "Oct 2026, Nov 2026", "2026", "All time".
export function periodLabel(period: Period): string {
  if (period.kind === "all") return "All time";
  if (period.kind === "year") return String(period.year);
  if (period.months.length === 1) return monthName(period.months[0]);
  return period.months.map((m) => `${MONTHS[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`).join(", ");
}

export function inPeriod(date: string | null, period: Period): boolean {
  if (date === null) return false;
  if (period.kind === "all") return true;
  if (period.kind === "year") return date.slice(0, 4) === String(period.year);
  return period.months.includes(monthOf(date));
}

// The months a period covers, used to lay out the over-time chart.
// All time runs from the first purchase to this month (or the last purchase, if later).
export function periodMonths(items: StatItem[], period: Period, today: string): string[] {
  if (period.kind === "months") return period.months;
  if (period.kind === "year") return monthRange(`${period.year}-01`, `${period.year}-12`);
  const bought = items.map((i) => i.purchased_on).filter((d): d is string => d !== null).map(monthOf).sort();
  const first = bought[0] && bought[0] < monthOf(today) ? bought[0] : monthOf(today);
  const last = bought.at(-1) && bought.at(-1)! > monthOf(today) ? bought.at(-1)! : monthOf(today);
  return monthRange(first, last);
}

// Months and years that have purchases (plus the current ones), newest first, for the filter.
export function availableMonths(items: StatItem[], today: string): string[] {
  const set = new Set([monthOf(today), ...items.flatMap((i) => (i.purchased_on ? [monthOf(i.purchased_on)] : []))]);
  return [...set].sort().reverse();
}
export function availableYears(items: StatItem[], today: string): number[] {
  return [...new Set(availableMonths(items, today).map((m) => Number(m.slice(0, 4))))].sort((a, b) => b - a);
}

// The chart grouping that reads best for a period.
export function defaultGrouping(period: Period): Grouping {
  if (period.kind === "months") return period.months.length === 1 ? "day" : "week";
  return "month";
}

// ---------- spending ----------

// Sum of prices of items purchased in the period. Items without a price count as $0.
export function spentInPeriod(items: StatItem[], period: Period): number {
  return roundCents(items.filter((i) => inPeriod(i.purchased_on, period)).reduce((s, i) => s + Number(i.price ?? 0), 0));
}

// Kept for the PLAN.md test: spending in today's calendar month.
export function spentThisMonth(items: StatItem[], today: string): number {
  return spentInPeriod(items, currentMonthPeriod(today));
}

// Spending per category in the period, biggest first. Categories with $0 are left out.
export function spendingByCategory(items: StatItem[], period: Period): CategorySpend[] {
  const totals = new Map<string, number>();
  for (const i of items) {
    if (!inPeriod(i.purchased_on, period) || !i.price) continue;
    totals.set(i.category, (totals.get(i.category) ?? 0) + Number(i.price));
  }
  return [...totals]
    .map(([category, total]) => ({ category, total: roundCents(total) }))
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
}

// Spending in the period, one entry per day, week (Monday to Sunday) or month, oldest first.
// Empty buckets are $0; only purchases inside the period count, so the entries add up to spentInPeriod.
export function spendingOverTime(items: StatItem[], period: Period, today: string, grouping: Grouping): PeriodSpend[] {
  const months = periodMonths(items, period, today);
  const multiYear = new Set(months.map((m) => m.slice(0, 4))).size > 1;
  const buckets = new Map<string, PeriodSpend>();

  for (const month of months) {
    for (let d = `${month}-01`; monthOf(d) === month; d = addDays(d, 1)) {
      let key: string;
      let bucket: Omit<PeriodSpend, "total">;
      if (grouping === "day") {
        key = d;
        bucket = { label: shortDate(d), start: d, end: d };
      } else if (grouping === "week") {
        key = weekStart(d);
        bucket = { label: shortDate(key), start: key, end: addDays(key, 6) };
      } else {
        key = month;
        const short = MONTHS[Number(month.slice(5, 7)) - 1];
        bucket = { label: multiYear ? `${short} '${month.slice(2, 4)}` : short, start: `${month}-01`, end: addDays(`${nextMonth(month)}-01`, -1) };
      }
      if (!buckets.has(key)) buckets.set(key, { ...bucket, total: 0 });
    }
  }

  for (const i of items) {
    if (!i.price || !inPeriod(i.purchased_on, period)) continue;
    const d = i.purchased_on!;
    const key = grouping === "day" ? d : grouping === "week" ? weekStart(d) : monthOf(d);
    const bucket = buckets.get(key);
    if (bucket) bucket.total += Number(i.price);
  }

  return [...buckets.values()].map((b) => ({ ...b, total: roundCents(b.total) }));
}

// ---------- right now (not affected by the period) ----------

export function itemsInStock(items: StatItem[]): number {
  return items.filter((i) => i.in_stock).length;
}

// In-stock items whose expiry date is from today up to and including today + days.
// Already-expired items are not counted.
export function expiringSoon(items: StatItem[], today: string, days = 7): number {
  const last = addDays(today, days);
  return items.filter((i) => i.in_stock && i.expires_on !== null && i.expires_on >= today && i.expires_on <= last)
    .length;
}
