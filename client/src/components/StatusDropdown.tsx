import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type StatusType = "pending" | "approved" | "rejected";

interface StatusDropdownProps {
  currentStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
  disabled?: boolean;
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-blue-100", text: "text-blue-600", label: "Pending" },
  approved: { bg: "bg-green-100", text: "text-green-600", label: "Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-600", label: "Rejected" },
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (status: StatusType) => {
    if (status !== currentStatus) {
      onStatusChange(status);
    }
    setIsOpen(false);
  };

  const config = statusConfig[currentStatus];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all
          ${config.bg} ${config.text}
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Status: ${config.label}`}
      >
        {config.label}
        {!disabled && (
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 right-0 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden"
            role="listbox"
          >
            {(Object.keys(statusConfig) as StatusType[]).map((status) => {
              const opt = statusConfig[status];
              const isSelected = status === currentStatus;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(status);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                    ${isSelected ? "bg-gray-50" : "hover:bg-gray-50"}
                    ${opt.text}
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="font-medium">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusDropdown;
