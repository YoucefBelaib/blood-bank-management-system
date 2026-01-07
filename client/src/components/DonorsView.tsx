import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DonorDetailsModal from "./DonorDetailsModal";
import AddDonorModal from "./AddDonorModal";
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
  const hash = name
    .split("")
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
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
  const [showAddModal, setShowAddModal] = useState(false);

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
    return donors.filter(
      (d) =>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="#8e95a0ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-full bg-[#A30000] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors"
          >
            Add Donor
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        {/* List Body */}
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">
            Loading donors...
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            {query
              ? "No donors found matching your search"
              : "No donors available"}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-2xl shadow-sm mt-2">
            {filteredDonors.map((donor) => (
              <div
                key={donor.id}
                onClick={() => handleRowClick(donor)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
                <div className="flex items-center gap-3 w-1/3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(
                      donor.fullName
                    )}`}
                  >
                    {getInitials(donor.fullName)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {donor.fullName}
                  </span>
                </div>

                <div className="flex items-center text-[13px] text-gray-600 w-1/5 min-w-[120px]">
                  {formatDate(donor.createdAt)}
                </div>

                <div className="flex items-center w-1/6 min-w-[90px]">
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-[13px] font-semibold rounded">
                    {donor.bloodType}
                  </span>
                </div>

                <div
                  className="flex items-center text-sm text-gray-700 w-1/4 min-w-[140px] truncate"
                  title={donor.location}
                >
                  {donor.location}
                </div>

                <div
                  className="hidden lg:flex items-center text-sm text-gray-500 w-1/4 min-w-[180px] truncate"
                  title={donor.email}
                >
                  {donor.email}
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

      <AddDonorModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
