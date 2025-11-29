import React from "react";
import { useQuery } from "@tanstack/react-query";
import BarChartComponent from "@/components/stats/Barchart";
import PieChartComponent from "@/components/stats/piechart";
import LineChartComponent from "@/components/stats/linechart";
import { useAuth } from "@/lib/auth";
import { useLocation, Route, Switch } from "wouter";
import { Users, Building2, Clock } from "lucide-react";

interface DashboardStats {
  donorsByBloodType: { name: string; value: number }[];
  donorsByLocation: { name: string; value: number }[];
  totalDonors: number;
  monthlyDonorStats: { month: string; thisYear: number; lastYear: number }[];
  totalHospitals: number;
  totalPending: number;
}

const Dashboard: React.FC = () => {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
  });

  return (
    <>
    <div className="w-full flex flex-col gap-10">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Registered Donors */}
        <div className="bg-[#FFEEF0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#A30000] text-lg font-semibold">Total Registered Donors</h2>
              <p className="text-4xl font-bold text-[#A30000] mt-2">{stats?.totalDonors || 0}</p>
            </div>
            <div className="w-14 h-14 bg-[#A30000] rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Registered Hospitals */}
        <div className="bg-[#FFEEF0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#A30000] text-lg font-semibold">Total Registered Hospitals</h2>
              <p className="text-4xl font-bold text-[#A30000] mt-2">{stats?.totalHospitals || 0}</p>
            </div>
            <div className="w-14 h-14 bg-[#A30000] rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Pending */}
        <div className="bg-[#FFEEF0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#A30000] text-lg font-semibold">Total Pending</h2>
              <p className="text-4xl font-bold text-[#A30000] mt-2">{stats?.totalPending || 0}</p>
            </div>
            <div className="w-14 h-14 bg-[#A30000] rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Blood by Type */}
        <div className="bg-[#FFEEF0] rounded-3xl p-6 shadow-sm">
          <h2 className="text-[#A30000] text-xl font-semibold mb-4">
            Blood by Type
          </h2>
          <div className="w-full h-56 flex items-center justify-center text-gray-500">
            {/* Insert Recharts / Chart.js component here */}
            <BarChartComponent/>
          </div>
        </div>

        {/* Donors by Wilaya */}
        <div className="bg-[#FFEEF0] rounded-3xl p-6 shadow-sm">
          <h2 className="text-[#A30000] text-xl font-semibold mb-4">
            Donors By Location
          </h2>
          <div className="w-full h-56 flex items-center justify-center text-gray-500">
            <PieChartComponent />
          </div>
        </div>
      </div>

      {/* Line Chart Section */}
      <div className="bg-[#FFEEF0] rounded-3xl p-6 shadow-sm">
        <h2 className="text-[#A30000] text-xl font-semibold mb-4">
          Donor Registrations Over Time
        </h2>
        <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600"></span> This year
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Last year
          </span>
        </div>

        <div className="w-full h-64 flex items-center justify-center text-gray-500">
          <LineChartComponent />
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
