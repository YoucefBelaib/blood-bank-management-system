import { useAuth } from "@/lib/auth";
import React, { useState } from "react";
import { useLocation } from "wouter";

type Request = {
  id: number;
  name: string;
  date: string;
  blood: string;
  number: number;
  status: "In Progress" | "Complete" | "Pending" | "Approved" | "Rejected";
  avatar?: string;
};

const SAMPLE_DATA: Request[] = [
  { id: 1, name: "Howarie Boumediene Hospital", date: "Jun 24, 2025", blood: "O+", number: 15, status: "In Progress", avatar: "https://i.pravatar.cc/40?img=32" },
  { id: 2, name: "Hopital de Annaba", date: "Mar 10, 2025", blood: "O+", number: 15, status: "Complete", avatar: "https://i.pravatar.cc/40?img=5" },
  { id: 3, name: "Hopital de Setif", date: "Nov 10, 2025", blood: "A-", number: 15, status: "Pending", avatar: "https://i.pravatar.cc/40?img=12" },
  { id: 4, name: "Borj El Mouraqaba Clinic", date: "Dec 20, 2025", blood: "A+", number: 15,status: "Approved", avatar: "https://i.pravatar.cc/40?img=7" },
  { id: 5, name: "Andi Lane", date: "Jul 25, 2025", blood: "AB+", number: 15, status: "Rejected", avatar: "https://i.pravatar.cc/40?img=45" },
  { id: 6, name: "Natali Craig", date: "Mar 10, 2025", blood: "AB-", number: 15, status: "Complete", avatar: "https://i.pravatar.cc/40?img=5" },
  { id: 7, name: "Drew Cano", date: "Nov 10, 2025", blood: "A+", number: 15, status: "Pending", avatar: "https://i.pravatar.cc/40?img=12" },
  { id: 8, name: "Orlando Diggs", date: "Dec 20, 2025", blood: "O+", number: 15, status: "Approved", avatar: "https://i.pravatar.cc/40?img=7" },
  { id: 9, name: "Andi Lane", date: "Jul 25, 2025", blood: "A+", number: 15, status: "Rejected", avatar: "https://i.pravatar.cc/40?img=45" },
];

function statusClasses(status: Request["status"]) {
  switch (status) {
    case "In Progress":
      return "bg-gray-200 text-gray-800";
    case "Complete":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-blue-100 text-blue-700";
    case "Approved":
      return "bg-gray-100 text-gray-800";
    case "Rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function RequestsView() {
  const [query, setQuery] = useState("");

  const filtered = SAMPLE_DATA.filter((d) =>
    `${d.name} ${d.blood} ${d.status}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full bg-gray-50 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#0f172a]">Requests</h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="pl-10 pr-4 py-2 rounded-full border border-transparent bg-[#F8F6F6] text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#F5D6D8]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="#9CA3AF" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <button className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500">⋯</button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 px-2 py-2">
          <div className="col-span-5">Hospital Name</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Blood Type</div>
          <div className="col-span-2 text-center">Units Number</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {filtered.map((d, idx) => (
            <div
              key={d.id}
              className={`grid grid-cols-12 items-center gap-4 p-3 rounded-xl ${idx % 2 === 0 ? "bg-[#FFEEF0]" : "bg-white"} transition-transform duration-200 hover:scale-[1.002]`}
            >
              <div className="col-span-5 flex items-center gap-4">
                <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="text-sm text-gray-800 font-medium">{d.name}</div>
              </div>

              <div className="col-span-2 text-sm text-gray-700">{d.date}</div>

              <div className="col-span-1 text-sm text-gray-700">{d.blood}</div>

              <div className="col-span-2 text-sm text-gray-700 text-center">{d.number}</div>

              <div className="col-span-2 flex justify-end">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses(d.status)}`}>{d.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
