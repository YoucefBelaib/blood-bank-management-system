import React, { useEffect } from "react";
import { X, User, Droplet, Calendar, MapPin, Phone, Mail, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Donor } from "@shared/schema";

// Status configuration (matching DonorsList)
const statusConfig = {
  "In Progress": { bg: "bg-gray-200", text: "text-gray-700" },
  "Complete": { bg: "bg-blue-100", text: "text-blue-600" },
  "Pending": { bg: "bg-blue-100", text: "text-blue-500" },
  "Approved": { bg: "bg-gray-200", text: "text-gray-700" },
  "Rejected": { bg: "bg-red-100", text: "text-red-600" },
} as const;

type DonorStatus = keyof typeof statusConfig;

interface DonorWithStatus extends Donor {
  status?: DonorStatus;
}

interface DonorDetailsModalProps {
  donor: DonorWithStatus;
  onClose: () => void;
}

// Generate avatar color (same as DonorsList)
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
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Get initials (same as DonorsList)
const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Format date
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const DonorDetailsModal: React.FC<DonorDetailsModalProps> = ({ donor, onClose }) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 px-8 pt-8 pb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${getAvatarColor(
                  donor.fullName
                )}`}
              >
                {getInitials(donor.fullName)}
              </div>

              {/* Name and Status */}
              <div className="flex-1 pt-2">
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  {donor.fullName}
                </h2>
                {donor.status && (
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                      statusConfig[donor.status].bg
                    } ${statusConfig[donor.status].text}`}
                  >
                    {donor.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Donor ID */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Hash className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Donor ID</p>
                  <p className="text-base font-medium text-gray-900">
                    {donor.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Blood Type */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Droplet className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Blood Type</p>
                  <p className="text-base font-bold text-red-600">
                    {donor.bloodType}
                  </p>
                </div>
              </div>

              {/* Registration Date */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Registration Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(donor.createdAt)}
                  </p>
                </div>
              </div>

              {/* Age & Gender */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Age & Gender</p>
                  <p className="text-base font-medium text-gray-900">
                    {donor.age} years, {donor.gender.charAt(0).toUpperCase() + donor.gender.slice(1)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-base font-medium text-gray-900">
                    {donor.location}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-base font-medium text-gray-900">
                    {donor.phone}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="col-span-2 flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {donor.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Active Donor Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    donor.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {donor.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => {
                // Add contact functionality here
                window.location.href = `mailto:${donor.email}`;
              }}
            >
              Contact Donor
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DonorDetailsModal;
