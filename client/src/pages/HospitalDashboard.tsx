import React, { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Droplet,
  Building2,
  LogOut,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package,
  AlertTriangle,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useHospitalAuth,
  useHospitalBloodRequests,
} from "@/features/hospitals";
import type { BloodRequest } from "@/types";

// Format date
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Get status color
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "pending":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    case "pending":
    default:
      return <Clock className="w-4 h-4" />;
  }
};

// Get urgency color
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

// Request Detail Modal Component
interface RequestModalProps {
  request: BloodRequest;
  onClose: () => void;
}

const RequestDetailModal: React.FC<RequestModalProps> = ({
  request,
  onClose,
}) => {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Blood Request Details</h2>
                  <p className="text-red-100 text-sm">
                    Request ID: {request.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Status & Urgency */}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                  request.status
                )}`}
              >
                {getStatusIcon(request.status)}
                {request.status.charAt(0).toUpperCase() +
                  request.status.slice(1)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 ${getUrgencyColor(
                  request.urgencyLevel
                )}`}
              >
                <AlertTriangle className="w-4 h-4" />
                {request.urgencyLevel}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <Droplet className="w-4 h-4" />
                  <span className="text-sm font-medium">Blood Type</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {request.bloodType}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Units Needed</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {request.unitsNeeded}
                </p>
              </div>
            </div>

            {/* Info List */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">
                    {request.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {request.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {request.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Request Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={onClose}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function HospitalDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(
    null
  );

  // Check authentication using hook
  const {
    hospital,
    isLoading: authLoading,
    isAuthenticated,
    logout,
  } = useHospitalAuth();

  // Fetch hospital's blood requests using hook
  const { requests, isLoading: requestsLoading } = useHospitalBloodRequests();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/hospital");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description:
          error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    }
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/hospital");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Filter requests based on search
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter(
      (r) =>
        r.bloodType.toLowerCase().includes(query) ||
        r.status.toLowerCase().includes(query) ||
        r.urgencyLevel.toLowerCase().includes(query)
    );
  }, [requests, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-red-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hospital) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-red-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-red-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-950">
                  {hospital.name}
                </h1>
                <p className="text-sm text-red-600">{hospital.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/hospital/request">
                <a className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
                  <Plus className="w-5 h-5" />
                  New Request
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Total Requests</p>
                <p className="text-3xl font-bold text-red-950">
                  {requests.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Approved</p>
                <p className="text-3xl font-bold text-green-700">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Rejected</p>
                <p className="text-3xl font-bold text-red-700">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-red-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-950">
                Request History
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-red-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all w-64"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {requestsLoading ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Droplet className="w-12 h-12 text-red-200 mx-auto mb-4" />
              <p className="text-gray-500">No blood requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-900">
                      Blood Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-900">
                      Units
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-900">
                      Urgency
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-900">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-red-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-red-600" />
                          </div>
                          <span className="font-bold text-red-900">
                            {request.bloodType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {request.unitsNeeded} units
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-1 ${getUrgencyColor(
                            request.urgencyLevel
                          )}`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          {request.urgencyLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                          }}
                          className="px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
