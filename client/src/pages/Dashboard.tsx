import React from "react";
import BarChartComponent from "@/components/stats/Barchart";
import PieChartComponent from "@/components/stats/piechart";
import LineChartComponent from "@/components/stats/linechart";
import { useAuth } from "@/lib/auth";
import { useLocation, Route, Switch } from "wouter";

const Dashboard: React.FC = () => {

  return (
    <>
    <div className="w-full flex flex-col gap-10">
      
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
            Donors By Wilaya
          </h2>
          <div className="w-full h-56 flex items-center justify-center text-gray-500">
            <PieChartComponent />
          </div>
        </div>
      </div>

      {/* Line Chart Section */}
      <div className="bg-[#FFEEF0] rounded-3xl p-6 shadow-sm">
        <h2 className="text-[#A30000] text-xl font-semibold mb-4">
          Total Donors
        </h2>
        <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
          <span className="text-black font-semibold">blood quantity</span>
          <span>Hospotils</span>
          <span className="mx-2">|</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-black"></span> This year
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
