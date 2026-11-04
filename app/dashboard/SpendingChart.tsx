"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategorySpend } from "@/lib/stats";

const money = (n: number) => `$${n.toFixed(2)}`;

// Horizontal bars: category names stay readable, biggest spend on top.
export default function SpendingChart({ data }: { data: CategorySpend[] }) {
  const height = Math.max(120, data.length * 40 + 20);

  return (
    <div style={{ height }} role="img" aria-label={`Spending by category: ${data.map((d) => `${d.category} ${money(d.total)}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="category"
            width={110}
            tickLine={false}
            axisLine={{ stroke: "#d9d1e4" }}
            tick={{ fill: "#5f5868", fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: "#f8f6fb" }}
            formatter={(value) => [money(Number(value)), "Spent"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #ebe6f2", fontSize: 13 }}
          />
          <Bar dataKey="total" fill="#6e3a8c" barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey="total" position="right" formatter={(v) => money(Number(v))} fill="#1f1a24" fontSize={13} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
