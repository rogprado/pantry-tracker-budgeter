"use client";

import { useState } from "react";
import { buttonClass } from "@/app/components/ui/Button";
import { monthName, type Period } from "@/lib/stats";

type Choice = "this" | "months" | "year" | "all";

// A plain GET form (full page load, like the pantry filters): the choice ends up in the URL,
// e.g. /dashboard?period=months&m=2026-10&m=2026-11. Hidden sections are disabled so they aren't sent.
export default function PeriodFilter({
  period,
  currentMonth,
  months,
  years,
}: {
  period: Period;
  currentMonth: string;
  months: string[];
  years: number[];
}) {
  const initial: Choice =
    period.kind === "months" ? (period.months.length === 1 && period.months[0] === currentMonth ? "this" : "months") : period.kind;
  const [choice, setChoice] = useState<Choice>(initial);
  const selectedMonths = period.kind === "months" ? period.months : [currentMonth];
  const selectedYear = period.kind === "year" ? period.year : years[0];

  const options: [Choice, string][] = [
    ["this", "This month"],
    ["months", "Choose months"],
    ["year", "Year"],
    ["all", "All time"],
  ];

  return (
    <form method="get" action="/dashboard" className="rounded-card border border-lavender-200/70 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex flex-wrap items-center gap-3">
          <legend className="sr-only">Period</legend>
          <span className="text-sm font-bold text-ink">Period</span>
          <div className="flex flex-wrap rounded-xl bg-lavender p-1">
            {options.map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center rounded-lg px-3 py-1.5 text-sm font-bold text-muted transition hover:text-eggplant has-[:checked]:bg-white has-[:checked]:text-eggplant has-[:checked]:shadow-sm has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/25"
              >
                <input
                  type="radio"
                  name="period"
                  value={value}
                  checked={choice === value}
                  onChange={() => setChoice(value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {choice === "year" && (
          <label className="flex items-center gap-2 text-sm font-bold">
            <span>Year</span>
            <select name="year" defaultValue={selectedYear} className="rounded-xl border border-lavender-300 bg-white px-3 py-2 text-base">
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}

        <button type="submit" className={buttonClass("primary", "sm")}>
          Apply
        </button>
      </div>

      {choice === "months" && (
        <fieldset className="mt-4 flex flex-wrap gap-2 border-t border-lavender-200 pt-4">
          <legend className="mb-2 text-sm text-muted">Tick one or more months:</legend>
          {months.map((m) => (
            <label
              key={m}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-lavender-300 px-3 py-1.5 text-sm font-semibold text-ink has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-eggplant"
            >
              <input type="checkbox" name="m" value={m} defaultChecked={selectedMonths.includes(m)} className="accent-primary" />
              {monthName(m)}
            </label>
          ))}
        </fieldset>
      )}
    </form>
  );
}
