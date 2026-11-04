import { CircleAlert, CircleCheck, Clock, PiggyBank } from "lucide-react";
import { ButtonLink, Card } from "@/app/components/ui";
import { budgetStatus } from "@/lib/budget";

const money = (n: number) => `$${Math.abs(n).toFixed(2)}`;

// This month's spending against the monthly budget: green below 80%, amber from 80%, red above 100%.
export default function BudgetBar({ spent, budget, month }: { spent: number; budget: number | null; month: string }) {
  if (budget === null) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-plum">
            <PiggyBank size={20} aria-hidden="true" />
          </span>
          <p className="text-base text-muted">Set a monthly grocery budget and we&apos;ll keep an eye on it for you.</p>
        </div>
        <ButtonLink href="/settings" variant="secondary">
          Set a budget
        </ButtonLink>
      </Card>
    );
  }

  const s = budgetStatus(spent, budget);
  const look = {
    ok: { bar: "bg-fresh", text: "text-fresh-ink", Icon: CircleCheck, message: `${money(s.left)} left to spend this month. Nicely done.` },
    warning: { bar: "bg-soon", text: "text-soon-ink", Icon: Clock, message: `Heads up: ${s.percent}% of your ${month} budget is gone. ${money(s.left)} left.` },
    over: { bar: "bg-expired", text: "text-expired-ink", Icon: CircleAlert, message: `You're ${money(s.left)} over your ${month} budget. Time to cook from the shelves.` },
  }[s.level];

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-medium text-eggplant">{month} budget</h2>
        <p className="text-base text-muted">
          <span className="font-display text-2xl font-medium text-eggplant">{money(s.spent)}</span> of {money(s.budget)} ·{" "}
          {s.percent}%
          <a href="/settings" className="ml-3 text-sm font-semibold text-plum hover:text-eggplant">
            Edit
          </a>
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={`${month} budget used`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(s.percent, 100)}
        aria-valuetext={`${s.percent}% used`}
        className="mt-3 h-3.5 overflow-hidden rounded-full bg-lavender-200"
      >
        <div className={`h-full rounded-full ${look.bar}`} style={{ width: `${Math.min(s.percent, 100)}%` }} />
      </div>
      <p className={`mt-3 flex items-center gap-2 text-base font-semibold ${look.text}`} role={s.level === "ok" ? undefined : "status"}>
        <look.Icon size={18} aria-hidden="true" />
        {look.message}
      </p>
    </Card>
  );
}
