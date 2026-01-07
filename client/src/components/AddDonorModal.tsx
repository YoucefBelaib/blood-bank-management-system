import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  User,
  Droplet,
  MapPin,
  Phone,
  Mail,
  PlusCircle,
} from "lucide-react";
import { insertDonorSchema, type InsertDonor } from "../../../shared/schema";

interface AddDonorModalProps {
  open: boolean;
  onClose: () => void;
}

const genderOptions = ["Male", "Female", "Other"] as const;
const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const AddDonorModal: React.FC<AddDonorModalProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsertDonor>({
    resolver: zodResolver(insertDonorSchema),
    defaultValues: {
      fullName: "",
      age: undefined,
      gender: "",
      bloodType: "",
      location: "",
      phone: "",
      email: "",
    },
  });

  const createDonor = useMutation({
    mutationFn: async (payload: InsertDonor) => {
      const response = await fetch("/api/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create donor");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      reset();
      onClose();
    },
  });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  const onSubmit = handleSubmit((values) => {
    createDonor.mutate(values);
  });

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <PlusCircle className="w-5 h-5 text-[#A30000]" />
                Add Donor
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="px-6 py-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Full Name"
                  icon={<User className="w-4 h-4 text-[#A30000]" />}
                >
                  <input
                    {...register("fullName")}
                    placeholder="Jane Doe"
                    required
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {errors.fullName && (
                    <ErrorText message={errors.fullName.message} />
                  )}
                </Field>

                <Field
                  label="Age"
                  icon={<User className="w-4 h-4 text-[#A30000]" />}
                >
                  <input
                    type="number"
                    min={0}
                    {...register("age", { valueAsNumber: true })}
                    placeholder="30"
                    required
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {errors.age && <ErrorText message={errors.age.message} />}
                </Field>

                <Field
                  label="Gender"
                  icon={<User className="w-4 h-4 text-[#A30000]" />}
                >
                  <select
                    {...register("gender")}
                    required
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <ErrorText message={errors.gender.message} />
                  )}
                </Field>

                <Field
                  label="Blood Type"
                  icon={<Droplet className="w-4 h-4 text-[#A30000]" />}
                >
                  <select
                    {...register("bloodType")}
                    required
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="" disabled>
                      Select blood type
                    </option>
                    {bloodTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.bloodType && (
                    <ErrorText message={errors.bloodType.message} />
                  )}
                </Field>

                <Field
                  label="Location"
                  icon={<MapPin className="w-4 h-4 text-[#A30000]" />}
                >
                  <input
                    {...register("location")}
                    placeholder="Algiers, Algeria"
                    required
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {errors.location && (
                    <ErrorText message={errors.location.message} />
                  )}
                </Field>

                <Field
                  label="Phone"
                  icon={<Phone className="w-4 h-4 text-[#A30000]" />}
                >
                  <input
                    {...register("phone")}
                    placeholder="(+213) 555-123-456"
                    required
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {errors.phone && <ErrorText message={errors.phone.message} />}
                </Field>

                <Field
                  label="Email"
                  icon={<Mail className="w-4 h-4 text-[#A30000]" />}
                >
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="jane@example.com"
                    required
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {errors.email && <ErrorText message={errors.email.message} />}
                </Field>
              </div>

              {createDonor.isError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {(createDonor.error as Error).message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDonor.isPending}
                  className="px-6 py-2.5 bg-[#A30000] text-white rounded-lg font-semibold shadow-sm hover:bg-[#8B0000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {createDonor.isPending && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  )}
                  {createDonor.isPending ? "Saving" : "Save Donor"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1">
    <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
      {icon}
      {label}
    </span>
    {children}
  </div>
);

const ErrorText = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
};

export default AddDonorModal;
