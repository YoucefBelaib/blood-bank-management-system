import React, { useEffect } from "react";
import {
  X,
  User,
  Droplet,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Hash,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDonors } from "@/features/donors";
import type { Donor } from "@/types";

interface DonorDetailsModalProps {
  donor: Donor;
  onClose: () => void;
}

// Generate avatar color
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

const DonorDetailsModal: React.FC<DonorDetailsModalProps> = ({
  donor,
  onClose,
}) => {
  const { deleteDonor, isDeleting } = useDonors();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this donor?"
    );
    if (!confirmed || isDeleting) return;

    try {
      await deleteDonor(donor.id);
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

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
              <div
                className={`w-16 h-16 ${getAvatarColor(
                  donor.fullName
                )} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0`}
              >
                {getInitials(donor.fullName)}
              </div>

              <div className="flex-1 pt-2">
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  {donor.fullName}
                </h2>
              </div>
            </div>

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
            {/* Personal Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#A30000]" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoField
                  icon={<Hash className="w-4 h-4" />}
                  label="Donor ID"
                  value={donor.id.slice(0, 8)}
                />
                <InfoField
                  icon={<User className="w-4 h-4" />}
                  label="Age"
                  value={`${donor.age} years`}
                />
                <InfoField
                  icon={<User className="w-4 h-4" />}
                  label="Gender"
                  value={donor.gender}
                />
                <InfoField
                  icon={<Droplet className="w-4 h-4" />}
                  label="Blood Type"
                  value={donor.bloodType}
                />
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#A30000]" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <InfoField
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={donor.phone}
                />
                <InfoField
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={donor.email}
                  clickable
                />
                <InfoField
                  icon={<MapPin className="w-4 h-4" />}
                  label="Location"
                  value={donor.location}
                />
              </div>
            </section>

            {/* Additional Details */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#A30000]" />
                Additional Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <InfoField
                  icon={<Calendar className="w-4 h-4" />}
                  label="Registered"
                  value={formatDate(donor.createdAt)}
                />
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-gray-50 px-8 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Donor"}
            </button>
            <a
              href={`mailto:${donor.email}`}
              className="px-6 py-2.5 bg-[#A30000] text-white rounded-lg font-medium hover:bg-[#8B0000] transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Donor
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  clickable?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({
  icon,
  label,
  value,
  clickable,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div
        className={`text-gray-900 font-semibold ${
          clickable ? "text-[#A30000] hover:underline cursor-pointer" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
};

export default DonorDetailsModal;
