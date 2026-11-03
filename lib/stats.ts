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

// The app's home time zone, so "today" and "this month" match the kitchen, not the server (UTC).
export const TIME_ZONE = "America/Los_Angeles";

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

const sameMonth = (date: string | null, today: string) => date !== null && date.slice(0, 7) === today.slice(0, 7);
const roundCents = (n: number) => Math.round(n * 100) / 100;

// Sum of prices of items purchased in today's calendar month. Items without a price count as $0.
export function spentThisMonth(items: StatItem[], today: string): number {
  return roundCents(
    items.filter((i) => sameMonth(i.purchased_on, today)).reduce((sum, i) => sum + Number(i.price ?? 0), 0),
  );
}

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

// This month's spending per category, biggest first. Categories with $0 are left out.
export function spendingByCategory(items: StatItem[], today: string): CategorySpend[] {
  const totals = new Map<string, number>();
  for (const i of items) {
    if (!sameMonth(i.purchased_on, today) || !i.price) continue;
    totals.set(i.category, (totals.get(i.category) ?? 0) + Number(i.price));
  }
  return [...totals]
    .map(([category, total]) => ({ category, total: roundCents(total) }))
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
}
