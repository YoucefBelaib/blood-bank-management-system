import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// Values in raw numbers (display formatted as K)
const data = [
  { name: "O+", value: 17000 },
  { name: "A+", value: 30000 },
  { name: "O-", value: 22000 },
  { name: "AB+", value: 32000 },
  { name: "A-", value: 13000 },
  { name: "B+", value: 25000 },
];

export default function BarChartComponent() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 6 }}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            stroke="#9CA3AF"
            tickFormatter={(v) => `${v / 1000}K`}
            domain={[0, 35000]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => new Intl.NumberFormat().format(value)}
            cursor={{ stroke: "rgba(0,0,0,0.05)", strokeWidth: 1 }}
            contentStyle={{ borderRadius: 8 }}
          />
          <Bar
            dataKey="value"
            fill="#EF4444"
            radius={[8, 8, 8, 8]}
            barSize={28}
            isAnimationActive={true}
            animationDuration={800}
          >
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v: number) => `${v / 1000}K`}
              style={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
