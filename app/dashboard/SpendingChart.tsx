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
            axisLine={{ stroke: "#ddd2ef" }}
            tick={{ fill: "#5e5568", fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: "#f7f4fc" }}
            formatter={(value) => [money(Number(value)), "Spent"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #ece5f7", fontSize: 13 }}
          />
          <Bar dataKey="total" fill="#7c4ddb" barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey="total" position="right" formatter={(v) => money(Number(v))} fill="#2b2233" fontSize={13} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
