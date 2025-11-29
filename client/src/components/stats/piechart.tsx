import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

interface DashboardStats {
  donorsByBloodType: { name: string; value: number }[];
  donorsByLocation: { name: string; value: number }[];
  totalDonors: number;
  monthlyDonorStats: { month: string; thisYear: number; lastYear: number }[];
}

const COLORS = ["#111827", "#60A5FA", "#EF4444", "#93C5FD", "#F87171"];

export default function PieChartComponent() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
  });

  const chartData = stats?.donorsByLocation || [];
  const total = chartData.reduce((s, d) => s + d.value, 0);
  const topLocation = chartData.length > 0 ? chartData[0].name : "N/A";

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No location data available
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Chart + Legend layout */}
      <div className="w-full flex items-center justify-between gap-6">
        <div className="w-1/2 h-56 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: number) => `${value} donors`}
                cursor={false}
              />
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={80}
                paddingAngle={6}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="text-sm text-gray-800 font-semibold">Top</span>
            <span className="text-xs text-gray-500">{topLocation}</span>
          </div>
        </div>

        <div className="w-1/2 flex flex-col items-start justify-center px-2">
          <h3 className="text-sm text-[#0f172a] font-semibold mb-3">Donors By Location</h3>
          <ul className="flex flex-col gap-3">
            {chartData.map((item, idx) => (
              <li key={item.name} className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ background: COLORS[idx % COLORS.length] }}
                />
                <span className="text-sm text-gray-700 w-28 truncate">{item.name}</span>
                <span className="text-sm text-gray-500">
                  {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
