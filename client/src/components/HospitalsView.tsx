import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MoreVertical, Building2, Droplet, AlertTriangle, Plus, X, Eye, EyeOff } from "lucide-react";
import StatusDropdown, { type StatusType } from "./StatusDropdown";
import BloodRequestModal from "./BloodRequestModal";
import HospitalDetailsModal from "./HospitalDetailsModal";
import { useToast } from "@/hooks/use-toast";
import type { BloodRequest, Hospital } from "../../../shared/schema";

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

// Get urgency icon color
const getUrgencyColor = (urgency: string): string => {
  switch (urgency.toLowerCase()) {
    case "critical":
      return "text-red-600";
    case "urgent":
      return "text-orange-500";
    case "normal":
    default:
      return "text-green-500";
  }
};

const HospitalsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    address: "",
    contactPerson: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch blood requests from API
  const { data: bloodRequests = [], isLoading: requestsLoading } = useQuery<BloodRequest[]>({
    queryKey: ["blood-requests"],
    queryFn: async () => {
      const response = await fetch("/api/blood-requests");
      if (!response.ok) throw new Error("Failed to fetch blood requests");
      return response.json();
    },
  });

  // Fetch hospitals from API
  const { data: hospitals = [], isLoading: hospitalsLoading } = useQuery<Hospital[]>({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const response = await fetch("/api/hospitals");
      if (!response.ok) throw new Error("Failed to fetch hospitals");
      return response.json();
    },
  });

  // Update blood request status mutation
  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusType }) => {
      const response = await fetch(`/api/blood-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
      toast({
        title: "Status Updated",
        description: `Blood request status changed to ${updatedRequest.status}`,
      });
      // Update selected request if modal is open
      if (selectedRequest?.id === updatedRequest.id) {
        setSelectedRequest(updatedRequest);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blood request status",
        variant: "destructive",
      });
    },
  });

  // Update hospital status mutation
  const updateHospitalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusType }) => {
      const response = await fetch(`/api/hospitals/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: (updatedHospital) => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      toast({
        title: "Hospital Status Updated",
        description: updatedHospital.status === "approved" 
          ? `${updatedHospital.name} has been approved and can now access the platform`
          : updatedHospital.status === "rejected"
          ? `${updatedHospital.name}'s registration has been rejected`
          : `${updatedHospital.name}'s status changed to pending`,
      });
      // Update selected hospital if modal is open
      if (selectedHospital?.id === updatedHospital.id) {
        setSelectedHospital(updatedHospital);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hospital status",
        variant: "destructive",
      });
    },
  });

  // Create hospital mutation
  const createHospital = useMutation({
    mutationFn: async (data: typeof hospitalForm) => {
      const response = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create hospital");
      }
      return response.json();
    },
    onSuccess: (newHospital) => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      toast({
        title: "Hospital Created",
        description: `${newHospital.name} has been added successfully. They can now log in at /hospital`,
      });
      setShowAddHospitalModal(false);
      setHospitalForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        location: "",
        address: "",
        contactPerson: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create hospital",
        variant: "destructive",
      });
    },
  });

  // Filter blood requests based on search
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return bloodRequests;
    const query = searchQuery.toLowerCase();
    return bloodRequests.filter(
      (req) =>
        req.hospitalName.toLowerCase().includes(query) ||
        req.bloodType.toLowerCase().includes(query)
    );
  }, [bloodRequests, searchQuery]);

  // Filter hospitals for registration requests (pending/rejected) and separate approved
  const pendingHospitals = useMemo(() => {
    return hospitals.filter((h) => h.status !== "approved");
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    if (!searchQuery.trim()) return pendingHospitals;
    const query = searchQuery.toLowerCase();
    return pendingHospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.email.toLowerCase().includes(query)
    );
  }, [pendingHospitals, searchQuery]);

  const handleRequestStatusChange = (id: string, status: StatusType) => {
    updateRequestStatus.mutate({ id, status });
  };

  const handleHospitalStatusChange = (id: string, status: StatusType) => {
    updateHospitalStatus.mutate({ id, status });
  };

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalForm.name || !hospitalForm.email || !hospitalForm.password || !hospitalForm.phone || !hospitalForm.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createHospital.mutate(hospitalForm);
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
              placeholder="Search hospitals or requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              aria-label="Search hospitals and requests"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded border border-gray-200">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Content Area - Dual Panel Layout */}
      <div className="flex-1 px-10 py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* LEFT PANEL - Blood Requests */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Droplet className="w-6 h-6 text-[#A30000]" />
                  <h2 className="text-xl font-semibold text-gray-900">Blood Requests</h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {filteredRequests.length}
                  </span>
                </div>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-100 flex-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-gray-100">
                  <div className="col-span-3 text-sm font-medium text-gray-500">Hospital</div>
                  <div className="col-span-3 text-sm font-medium text-gray-500">Date</div>
                  <div className="col-span-2 text-sm font-medium text-gray-500">Blood Type</div>
                  <div className="col-span-1 text-sm font-medium text-gray-500">Units</div>
                  <div className="col-span-3 text-sm font-medium text-gray-500">Status</div>
                </div>

                {/* Table Body */}
                {requestsLoading ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    Loading blood requests...
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? "No requests found matching your search" : "No blood requests available"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        className="grid grid-cols-12 gap-2 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedRequest(request);
                          }
                        }}
                        aria-label={`View details for ${request.hospitalName}'s blood request`}
                      >
                        {/* Hospital Name with Avatar */}
                        <div className="col-span-3 flex items-center gap-2 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(
                              request.hospitalName
                            )}`}
                          >
                            {getInitials(request.hospitalName)}
                          </div>
                          <div className="flex items-center gap-1 min-w-0">
                            <AlertTriangle className={`w-3 h-3 flex-shrink-0 ${getUrgencyColor(request.urgencyLevel)}`} />
                            <span className="text-[13px] font-normal text-gray-900 truncate">
                              {request.hospitalName}
                            </span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-3 flex items-center text-[13px] text-gray-600 whitespace-nowrap">
                          {formatDate(request.createdAt)}
                        </div>

                        {/* Blood Type */}
                        <div className="col-span-2 flex items-center">
                          <span className="px-2 py-1 bg-red-50 text-red-700 text-[13px] font-semibold rounded">
                            {request.bloodType}
                          </span>
                        </div>

                        {/* Units */}
                        <div className="col-span-1 flex items-center text-[14px] text-gray-900 font-medium">
                          {request.unitsNeeded}
                        </div>

                        {/* Status Dropdown */}
                        <div className="col-span-3 flex items-center" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            currentStatus={request.status as StatusType}
                            onStatusChange={(status) => handleRequestStatusChange(request.id, status)}
                            disabled={updateRequestStatus.isPending}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL - Hospital Registration Requests */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-[#A30000]" />
                  <h2 className="text-xl font-semibold text-gray-900">Hospital Registrations</h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {filteredHospitals.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddHospitalModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#A30000] hover:bg-[#8B0000] text-white rounded-lg transition-colors text-sm font-medium"
                  aria-label="Add hospital"
                >
                  <Plus className="w-4 h-4" />
                  Add Hospital
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-100 flex-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-gray-100">
                  <div className="col-span-3 text-sm font-medium text-gray-500">Hospital Name</div>
                  <div className="col-span-3 text-sm font-medium text-gray-500">Date</div>
                  <div className="col-span-3 text-sm font-medium text-gray-500">Email</div>
                  <div className="col-span-3 text-sm font-medium text-gray-500">Status</div>
                </div>

                {/* Table Body */}
                {hospitalsLoading ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    Loading hospital registrations...
                  </div>
                ) : filteredHospitals.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? "No hospitals found matching your search" : "No pending registrations"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                    {filteredHospitals.map((hospital) => (
                      <div
                        key={hospital.id}
                        onClick={() => setSelectedHospital(hospital)}
                        className="grid grid-cols-12 gap-2 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedHospital(hospital);
                          }
                        }}
                        aria-label={`View details for ${hospital.name}`}
                      >
                        {/* Hospital Name with Avatar */}
                        <div className="col-span-3 flex items-center gap-2 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(
                              hospital.name
                            )}`}
                          >
                            {getInitials(hospital.name)}
                          </div>
                          <span className="text-[13px] font-normal text-gray-900 truncate">
                            {hospital.name}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="col-span-3 flex items-center text-[13px] text-gray-600 whitespace-nowrap">
                          {formatDate(hospital.createdAt)}
                        </div>

                        {/* Email */}
                        <div className="col-span-3 flex items-center text-[13px] text-gray-600 min-w-0">
                          <span className="truncate" title={hospital.email}>
                            {hospital.email.split("@")[0]}
                          </span>
                        </div>

                        {/* Status Dropdown */}
                        <div className="col-span-3 flex items-center" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            currentStatus={hospital.status as StatusType}
                            onStatusChange={(status) => handleHospitalStatusChange(hospital.id, status)}
                            disabled={updateHospitalStatus.isPending}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Request Details Modal */}
      {selectedRequest && (
        <BloodRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={handleRequestStatusChange}
          isUpdating={updateRequestStatus.isPending}
        />
      )}

      {/* Hospital Details Modal */}
      {selectedHospital && (
        <HospitalDetailsModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
          onStatusChange={handleHospitalStatusChange}
          isUpdating={updateHospitalStatus.isPending}
        />
      )}

      {/* Add Hospital Modal */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddHospitalModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#A30000] to-[#8B0000] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Add New Hospital</h2>
                    <p className="text-red-100 text-sm">Create a hospital account</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddHospitalModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddHospital} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.name}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="City General Hospital"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={hospitalForm.email}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="contact@hospital.dz"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={hospitalForm.password}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 pr-10"
                      placeholder="Enter password for hospital login"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This password will be used by the hospital to access their dashboard at /hospital
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={hospitalForm.phone}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="+213555123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.location}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Downtown Algiers"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.address}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="123 Main Street, Downtown, Algiers"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.contactPerson}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Dr. Ahmed Benali"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createHospital.isPending}
                  className="flex-1 py-2.5 bg-[#A30000] hover:bg-[#8B0000] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createHospital.isPending ? "Creating..." : "Create Hospital"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalsView;
