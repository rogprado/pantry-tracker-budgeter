import Link from "next/link";
import { budgetStatus } from "@/lib/budget";

const money = (n: number) => `$${Math.abs(n).toFixed(2)}`;

// This month's spending against the monthly budget. Amber from 80%, red above 100%.
export default function BudgetBar({ spent, budget, month }: { spent: number; budget: number | null; month: string }) {
  if (budget === null) {
    return (
      <section className="card flex flex-wrap items-center justify-between gap-3">
        <p className="text-gray-600">Set a monthly grocery budget to track your spending against it.</p>
        <Link href="/settings" className="btn-outline py-2">
          Set a budget
        </Link>
      </section>
    );
  }

  const s = budgetStatus(spent, budget);
  const fill = s.level === "over" ? "bg-danger" : s.level === "warning" ? "bg-warning" : "bg-primary";
  const message =
    s.level === "over"
      ? `You're ${money(s.left)} over your ${month} budget. Maybe cook from what you have for the rest of the month.`
      : s.level === "warning"
        ? `Heads up: you've used ${s.percent}% of your ${month} budget. ${money(s.left)} left.`
        : `${money(s.left)} left this month.`;

  return (
    <section className="card space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold text-heading">{month} budget</h2>
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-heading">{money(s.spent)}</span> of {money(s.budget)} · {s.percent}%
          <Link href="/settings" className="ml-3 font-semibold text-primary">
            Edit
          </Link>
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={`${month} budget used`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(s.percent, 100)}
        aria-valuetext={`${s.percent}% used`}
        className="h-3 overflow-hidden rounded-full bg-lavender"
      >
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.min(s.percent, 100)}%` }} />
      </div>
      <p
        role={s.level === "ok" ? undefined : "status"}
        className={`text-sm ${s.level === "over" ? "font-semibold text-danger" : s.level === "warning" ? "font-semibold text-amber-800" : "text-gray-600"}`}
      >
        {s.level !== "ok" && <span aria-hidden="true">{s.level === "over" ? "⚠️ " : "⏳ "}</span>}
        {message}
      </p>
    </section>
  );
}
