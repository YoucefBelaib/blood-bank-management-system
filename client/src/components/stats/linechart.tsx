import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", thisYear: 12000, lastYear: 5000 },
  { month: "Feb", thisYear: 8000, lastYear: 12000 },
  { month: "Mar", thisYear: 15000, lastYear: 20000 },
  { month: "Apr", thisYear: 25000, lastYear: 8000 },
  { month: "May", thisYear: 30000, lastYear: 12000 },
  { month: "Jun", thisYear: 22000, lastYear: 27000 },
  { month: "Jul", thisYear: 24000, lastYear: 31000 },
];

export default function LineChartComponent() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="colorThis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FCA5A5" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#FCA5A5" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#BFDBFE" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#BFDBFE" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="rgba(15,23,42,0.03)" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
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
            cursor={false}
          />
          {/* Legend */}
          <g>
            <foreignObject x={8} y={-6} width={300} height={40}>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black" />
                  <span className="text-black font-semibold">This year</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-gray-500">Last year</span>
                </div>
              </div>
            </foreignObject>
          </g>

          <Area
            type="monotone"
            dataKey="thisYear"
            stroke="#DC2626"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorThis)"
            dot={false}
            isAnimationActive={true}
            animationDuration={900}
          />

          <Area
            type="monotone"
            dataKey="lastYear"
            stroke="#60A5FA"
            strokeWidth={2}
            strokeDasharray="6 6"
            fillOpacity={1}
            fill="url(#colorLast)"
            dot={false}
            isAnimationActive={true}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
