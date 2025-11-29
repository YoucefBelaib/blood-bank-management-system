import React, { useEffect } from "react";
import { X, Building2, Calendar, MapPin, Phone, Mail, Hash, User, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusDropdown, { type StatusType } from "./StatusDropdown";
import type { Hospital } from "../../../shared/schema";

interface HospitalDetailsModalProps {
  hospital: Hospital;
  onClose: () => void;
  onStatusChange: (id: string, status: StatusType) => void;
  isUpdating?: boolean;
}

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

const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const HospitalDetailsModal: React.FC<HospitalDetailsModalProps> = ({
  hospital,
  onClose,
  onStatusChange,
  isUpdating = false,
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleStatusChange = (status: StatusType) => {
    onStatusChange(hospital.id, status);
  };

  const handleApprove = () => {
    onStatusChange(hospital.id, "approved");
  };

  const handleReject = () => {
    onStatusChange(hospital.id, "rejected");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-start justify-between rounded-t-2xl z-10">
            <div className="flex items-start gap-4 flex-1">
              {/* Avatar */}
              <div
                className={`w-16 h-16 ${getAvatarColor(hospital.name)} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0`}
              >
                {getInitials(hospital.name)}
              </div>

              <div className="flex-1 pt-2">
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {hospital.name}
                </h2>
                <p className="text-gray-500 text-sm">Hospital Registration Request</p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors -mt-1 -mr-2"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Hospital Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#A30000]" />
                Hospital Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoField icon={<Hash className="w-4 h-4" />} label="Hospital ID" value={hospital.id.slice(0, 8)} />
                <InfoField icon={<Calendar className="w-4 h-4" />} label="Registration Date" value={formatDate(hospital.createdAt)} />
                {hospital.contactPerson && (
                  <InfoField icon={<User className="w-4 h-4" />} label="Contact Person" value={hospital.contactPerson} />
                )}
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#A30000]" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <InfoField icon={<Phone className="w-4 h-4" />} label="Phone" value={hospital.phone} />
                <InfoField icon={<Mail className="w-4 h-4" />} label="Email" value={hospital.email} clickable />
                <InfoField icon={<MapPin className="w-4 h-4" />} label="Location" value={hospital.location} />
                {hospital.address && (
                  <InfoField icon={<MapPin className="w-4 h-4" />} label="Full Address" value={hospital.address} />
                )}
              </div>
            </section>

            {/* Status Management */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#A30000]" />
                Administrative Status
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Current Status</p>
                    <p className="text-gray-500 text-sm">
                      {hospital.status === "pending" 
                        ? "This hospital is awaiting approval to access the platform"
                        : hospital.status === "approved"
                        ? "This hospital has been approved and can access the platform"
                        : "This hospital's registration has been rejected"
                      }
                    </p>
                  </div>
                  <StatusDropdown
                    currentStatus={hospital.status as StatusType}
                    onStatusChange={handleStatusChange}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-gray-50 px-8 py-4 rounded-b-2xl border-t border-gray-200 flex justify-between">
            {/* Quick Actions (only show for pending) */}
            {hospital.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={isUpdating}
                  className="px-4 py-2.5 bg-white border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isUpdating}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
              </div>
            )}
            {hospital.status !== "pending" && <div />}
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${hospital.email}`}
                className="px-6 py-2.5 bg-[#A30000] text-white rounded-lg font-medium hover:bg-[#8B0000] transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Contact Hospital
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Helper component for information fields
interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  clickable?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({ icon, label, value, clickable }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className={`text-gray-900 font-semibold ${clickable ? "text-[#A30000] hover:underline cursor-pointer" : ""}`}>
        {value}
      </div>
    </div>
  );
};

export default HospitalDetailsModal;
