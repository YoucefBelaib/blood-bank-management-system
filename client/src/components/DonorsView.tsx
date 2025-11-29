import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import DonorDetailsModal from "./DonorDetailsModal";
import type { Donor } from "../../../shared/schema";

// Generate avatar color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  const hash = name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Get initials from full name
const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Format date to match design: "Mon DD, YYYY"
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function DonorView() {
  const [query, setQuery] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Fetch donors from API
  const { data: donors = [], isLoading } = useQuery<Donor[]>({
    queryKey: ["donors"],
    queryFn: async () => {
      const response = await fetch("/api/donors");
      if (!response.ok) throw new Error("Failed to fetch donors");
      return response.json();
    },
  });

  // Filter donors based on search query
  const filteredDonors = useMemo(() => {
    if (!query.trim()) return donors;
    const searchQuery = query.toLowerCase();
    return donors.filter((d) =>
      d.fullName.toLowerCase().includes(searchQuery) ||
      d.bloodType.toLowerCase().includes(searchQuery) ||
      d.location.toLowerCase().includes(searchQuery) ||
      d.email.toLowerCase().includes(searchQuery)
    );
  }, [donors, query]);

  const handleRowClick = (donor: Donor) => {
    setSelectedDonor(donor);
  };

  const handleCloseModal = () => {
    setSelectedDonor(null);
  };

  return (
    <div className="w-full bg-gray-50 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#0f172a]">Donors info</h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, blood type, location..."
              className="pl-10 pr-4 py-2 rounded-full border border-transparent bg-[#F0F0F0] text-sm w-80 focus:outline-none focus:ring-2 focus:ring-[#F5D6D8]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-4.35-4.35" stroke="#8e95a0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="#9CA3AF" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <Link href="/admin/donors/add" className="px-5 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
            Add
          </Link>
          <button className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
            ⋯
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 px-2 py-2">
          <div className="col-span-4">Donor Name</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Blood Type</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">
            Loading donors...
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            {query ? "No donors found matching your search" : "No donors available"}
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {filteredDonors.map((donor, idx) => (
              <div
                key={donor.id}
                onClick={() => handleRowClick(donor)}
                className={`grid grid-cols-12 items-center gap-4 p-3 rounded-xl cursor-pointer ${
                  idx % 2 === 0 ? "bg-[#FFEEF0]" : "bg-white"
                } transition-all duration-200 hover:scale-[1.002] hover:shadow-sm`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(donor);
                  }
                }}
                aria-label={`View details for ${donor.fullName}`}
              >
                {/* Donor Name with Avatar */}
                <div className="col-span-4 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(donor.fullName)}`}
                  >
                    {getInitials(donor.fullName)}
                  </div>
                  <div className="text-sm text-gray-800 font-medium">{donor.fullName}</div>
                </div>

                {/* Date */}
                <div className="col-span-2 text-sm text-gray-700">
                  {formatDate(donor.createdAt)}
                </div>

                {/* Blood Type */}
                <div className="col-span-2">
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-sm font-semibold rounded">
                    {donor.bloodType}
                  </span>
                </div>

                {/* Location */}
                <div className="col-span-2 text-sm text-gray-700 truncate" title={donor.location}>
                  {donor.location}
                </div>

                {/* Status */}
                <div className="col-span-2 flex justify-end">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      donor.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {donor.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donor Details Modal */}
      {selectedDonor && (
        <DonorDetailsModal donor={selectedDonor} onClose={handleCloseModal} />
      )}
    </div>
  );
}
