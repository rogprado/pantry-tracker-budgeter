"use client";

import { useState } from "react";
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
    <form method="get" action="/dashboard" className="card space-y-3 p-4">
      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <legend className="sr-only">Period</legend>
        <span className="text-sm font-semibold">Period</span>
        {options.map(([value, label]) => (
          <label key={value} className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="period"
              value={value}
              checked={choice === value}
              onChange={() => setChoice(value)}
              className="accent-primary"
            />
            {label}
          </label>
        ))}
      </fieldset>

      {choice === "months" && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-2 text-sm text-gray-600">Tick one or more months:</legend>
          {months.map((m) => (
            <label key={m} className="flex items-center gap-1.5 rounded-lg bg-lavender px-2.5 py-1 text-sm">
              <input type="checkbox" name="m" value={m} defaultChecked={selectedMonths.includes(m)} className="accent-primary" />
              {monthName(m)}
            </label>
          ))}
        </fieldset>
      )}

      {choice === "year" && (
        <label className="flex items-center gap-2 text-sm">
          <span>Year</span>
          <select name="year" defaultValue={selectedYear} className="input mt-0 w-auto">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      )}

      <button type="submit" className="btn">
        Apply
      </button>
    </form>
  );
}
