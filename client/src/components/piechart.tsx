import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

// Data represents donors by wilaya (values chosen so percentages match display)
const data = [
  { name: "Algiers", value: 52.1 },
  { name: "Annaba", value: 22.8 },
  { name: "Blida", value: 13.9 },
  { name: "Oran", value: 11.2 },
];

const COLORS = ["#111827", "#60A5FA", "#EF4444", "#93C5FD"];

export default function PieChartComponent() {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Chart + Legend layout */}
      <div className="w-full flex items-center justify-between gap-6">
        <div className="w-1/2 h-56 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: number) => `${value}%`}
                cursor={false}
              />
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={80}
                paddingAngle={6}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="text-sm text-gray-800 font-semibold">Top</span>
            <span className="text-xs text-gray-500">Algiers</span>
          </div>
        </div>

        <div className="w-1/2 flex flex-col items-start justify-center px-2">
          <h3 className="text-sm text-[#0f172a] font-semibold mb-3">Donors By Wilaya</h3>
          <ul className="flex flex-col gap-3">
            {data.map((item, idx) => (
              <li key={item.name} className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ background: COLORS[idx % COLORS.length] }}
                />
                <span className="text-sm text-gray-700 w-28">{item.name}</span>
                <span className="text-sm text-gray-500">{((item.value / total) * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
