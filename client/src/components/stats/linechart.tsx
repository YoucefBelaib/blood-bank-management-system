import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface DashboardStats {
  donorsByBloodType: { name: string; value: number }[];
  donorsByLocation: { name: string; value: number }[];
  totalDonors: number;
  monthlyDonorStats: { month: string; thisYear: number; lastYear: number }[];
}

export default function LineChartComponent() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
  });

  const chartData = stats?.monthlyDonorStats || [];
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.thisYear, d.lastYear)),
    10
  );

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
            domain={[0, maxValue + 5]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value,
              name === "thisYear" ? "This Year" : "Last Year"
            ]}
            cursor={false}
          />

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
