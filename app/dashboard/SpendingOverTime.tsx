"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PeriodSpend } from "@/lib/stats";

const money = (n: number) => `$${n.toFixed(2)}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const longDate = (d: string) => `${MONTHS[Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8, 10))}`;

// Columns of spending per day (this month) or per week (last 8 weeks).
// Both series come from the server; the toggle only switches which one is drawn, so there's no reload.
export default function SpendingOverTime({ byDay, byWeek, month }: { byDay: PeriodSpend[]; byWeek: PeriodSpend[]; month: string }) {
  const [view, setView] = useState<"day" | "week">("day");
  const data = view === "day" ? byDay : byWeek;
  const total = data.reduce((s, d) => s + d.total, 0);
  const caption = view === "day" ? `Each day in ${month}` : "Each week (Monday to Sunday), last 8 weeks";

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-heading">Spending over time</h2>
        <div role="group" aria-label="Group spending by" className="flex rounded-xl bg-lavender p-1 text-sm font-semibold">
          {(["day", "week"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1 ${view === v ? "bg-white text-heading shadow-sm" : "text-gray-600"}`}
            >
              By {v}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        {caption} · {money(total)} total
      </p>

      <div
        className="mt-4 h-56"
        role="img"
        aria-label={`Spending by ${view}: ${data.filter((d) => d.total > 0).map((d) => `${d.label} ${money(d.total)}`).join(", ") || "no spending"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#ece9f5" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#d4d0e0" }}
              tick={{ fill: "#4b4660", fontSize: 12 }}
              interval={view === "day" ? 4 : 0}
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
