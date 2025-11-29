import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, Settings, MoreVertical } from "lucide-react";
import DonorDetailsModal from "@/components/DonorDetailsModal";
import type { Donor } from "../../../shared/schema";

// Status configuration matching the design
const statusConfig = {
  "In Progress": { bg: "bg-gray-200", text: "text-gray-700" },
  "Complete": { bg: "bg-blue-100", text: "text-blue-600" },
  "Pending": { bg: "bg-blue-100", text: "text-blue-500" },
  "Approved": { bg: "bg-gray-200", text: "text-gray-700" },
  "Rejected": { bg: "bg-red-100", text: "text-red-600" },
} as const;

type DonorStatus = keyof typeof statusConfig;

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

// Assign status based on donor data (you can customize this logic)
const assignStatus = (donor: Donor): DonorStatus => {
  const statuses: DonorStatus[] = ["Complete", "In Progress", "Pending", "Approved", "Rejected"];
  // Simple hash-based assignment for demo (replace with real logic)
  const hash = donor.fullName.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return statuses[hash % statuses.length];
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

const DonorsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Fetch donors from backend
  const { data: donors = [], isLoading } = useQuery<Donor[]>({
    queryKey: ["donors"],
    queryFn: async () => {
      const response = await fetch("/api/donors");
      if (!response.ok) throw new Error("Failed to fetch donors");
      return response.json();
    },
  });

  // Filter donors based on search
  const filteredDonors = useMemo(() => {
    if (!searchQuery.trim()) return donors;
    
    const query = searchQuery.toLowerCase();
    return donors.filter(
      (donor) =>
        donor.fullName.toLowerCase().includes(query) ||
        donor.bloodType.toLowerCase().includes(query)
    );
  }, [donors, searchQuery]);

  const handleRowClick = (donor: Donor) => {
    setSelectedDonor(donor);
  };

  const handleCloseModal = () => {
    setSelectedDonor(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="w-full px-10 pt-8 pb-6 bg-gray-50/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              aria-label="Search donors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded border border-gray-200">
              /
            </kbd>
          </div>

          {/* Right Icons
          <div className="flex items-center gap-3 ml-6">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div> */}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-10 py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Donors info</h1>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-8 px-6 py-4 border-b border-gray-100">
              <div className="col-span-4 text-sm font-medium text-gray-500">
                Donor Name
              </div>
              <div className="col-span-3 text-sm font-medium text-gray-500">
                Date
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-500">
                Blood Type
              </div>
              <div className="col-span-3 text-sm font-medium text-gray-500">
                Status
              </div>
            </div>

            {/* Table Body */}
            {isLoading ? (
              <div className="px-6 py-12 text-center text-gray-500">
                Loading donors...
              </div>
            ) : filteredDonors.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                {searchQuery ? "No donors found matching your search" : "No donors available"}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredDonors.map((donor) => (
                  <div
                    key={donor.id}
                    onClick={() => handleRowClick(donor)}
                    className="grid grid-cols-12 gap-8 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
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
                    <div className="col-span-4 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(
                          donor.fullName
                        )}`}
                      >
                        {getInitials(donor.fullName)}
                      </div>
                      <span className="text-[15px] font-normal text-gray-900">
                        {donor.fullName}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-3 flex items-center text-[15px] text-gray-900">
                      {formatDate(donor.createdAt)}
                    </div>

                    {/* Blood Type */}
                    <div className="col-span-2 flex items-center text-[15px] font-medium text-gray-900">
                      {donor.bloodType}
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-3 flex items-center">
                      {(() => {
                        const status = assignStatus(donor);
                        return (
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium ${
                              statusConfig[status].bg
                            } ${statusConfig[status].text}`}
                          >
                            {status}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donor Details Modal */}
      {selectedDonor && (
        <DonorDetailsModal donor={selectedDonor} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default DonorsList;
