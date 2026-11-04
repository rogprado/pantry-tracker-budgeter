"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Grouping, PeriodSpend } from "@/lib/stats";

const money = (n: number) => `$${n.toFixed(2)}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const longDate = (d: string) => `${MONTHS[Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8, 10))}, ${d.slice(0, 4)}`;
const GROUPINGS: Grouping[] = ["day", "week", "month"];

// Columns of spending per day, week or month across the chosen period.
// All three series come from the server; the toggle only switches which one is drawn, so there's no reload.
export default function SpendingOverTime({
  series,
  initialGrouping,
  periodLabel,
}: {
  series: Record<Grouping, PeriodSpend[]>;
  initialGrouping: Grouping;
  periodLabel: string;
}) {
  const [grouping, setGrouping] = useState<Grouping>(initialGrouping);
  const data = series[grouping];
  const total = data.reduce((s, d) => s + d.total, 0);
  const labels = new Map(data.map((d) => [d.start, d.label]));
  // Show about 12 axis labels at most; the tooltip has every value.
  const interval = Math.max(0, Math.ceil(data.length / 12) - 1);

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-heading">Spending over time</h2>
        <div role="group" aria-label="Group spending by" className="flex rounded-xl bg-lavender p-1 text-sm font-semibold">
          {GROUPINGS.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={grouping === g}
              onClick={() => setGrouping(g)}
              className={`rounded-lg px-3 py-1 ${grouping === g ? "bg-white text-heading shadow-sm" : "text-gray-600"}`}
            >
              By {g}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        {periodLabel} · {money(total)} total{grouping === "week" && " · weeks run Monday to Sunday"}
      </p>

      <div
        className="mt-4 h-56"
        role="img"
        aria-label={`Spending by ${grouping}: ${data.filter((d) => d.total > 0).map((d) => `${d.label} ${money(d.total)}`).join(", ") || "no spending"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#ece9f5" />
            <XAxis
              dataKey="start"
              // Look the label up by the bucket's start date. Recharts' tick index counts only the
              // ticks it shows, not the data, so using it put labels on the wrong bars.
              tickFormatter={(start) => labels.get(String(start)) ?? ""}
              tickLine={false}
              axisLine={{ stroke: "#d4d0e0" }}
              tick={{ fill: "#4b4660", fontSize: 12 }}
              interval={interval}
            />
            <YAxis
              width={48}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#4b4660", fontSize: 12 }}
              tickFormatter={(v) => `$${v}`}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "#f4f1ff" }}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as PeriodSpend | undefined;
                if (!p) return "";
                return p.start === p.end ? longDate(p.start) : `${longDate(p.start)} – ${longDate(p.end)}`;
              }}
              formatter={(value) => [money(Number(value)), "Spent"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e1f5", fontSize: 13 }}
            />
            <Bar dataKey="total" fill="#6b4eff" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
