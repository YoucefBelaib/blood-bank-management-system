import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface DashboardStats {
  donorsByBloodType: { name: string; value: number }[];
  donorsByLocation: { name: string; value: number }[];
  totalDonors: number;
  monthlyDonorStats: { month: string; thisYear: number; lastYear: number }[];
}

export default function BarChartComponent() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
  });

  const chartData = stats?.donorsByBloodType || [];

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
        No donor data available
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 10);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 6 }}>
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
            domain={[0, maxValue + 5]}
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
              style={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
