import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Droplet,
  Building2,
  LogOut,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hospital {
  id: string;
  name: string;
  email: string;
  location: string;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels = ["normal", "urgent", "critical"];

export default function HospitalRequestForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    bloodType: "",
    unitsNeeded: 1,
    urgencyLevel: "normal",
    location: "",
    phone: "",
    email: "",
  });

  // Check authentication
  const { data: authData, isLoading: authLoading } = useQuery<{ hospital: Hospital }>({
    queryKey: ["hospital-auth"],
    queryFn: async () => {
      const response = await fetch("/api/hospital/auth/me");
      if (!response.ok) throw new Error("Not authenticated");
      return response.json();
    },
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/hospital/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      setLocation("/hospital");
    },
  });

  // Create blood request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof formData & { hospitalName: string; hospitalId: string }) => {
      const response = await fetch("/api/hospital/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital-requests"] });
      toast({
        title: "Request Created",
        description: "Your blood request has been submitted successfully.",
      });
      setLocation("/hospital/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blood request",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !authData) {
      setLocation("/hospital");
    }
  }, [authLoading, authData, setLocation]);

  // Pre-fill form with hospital data
  React.useEffect(() => {
    if (authData?.hospital) {
      setFormData((prev) => ({
        ...prev,
        location: authData.hospital.location,
        email: authData.hospital.email,
      }));
    }
  }, [authData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bloodType) {
      toast({
        title: "Validation Error",
        description: "Please select a blood type",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please enter a contact phone number",
        variant: "destructive",
      });
      return;
    }

    if (authData?.hospital) {
      createRequestMutation.mutate({
        ...formData,
        hospitalName: authData.hospital.name,
        hospitalId: authData.hospital.id,
      });
    }
  };

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

  if (!authData) return null;

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
                <h1 className="text-xl font-bold text-red-950">{authData.hospital.name}</h1>
                <p className="text-sm text-red-600">{authData.hospital.location}</p>
              </div>
            </div>

            <button
              onClick={() => logoutMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Link href="/hospital/dashboard">
          <a className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </a>
        </Link>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">New Blood Request</h2>
                  <p className="text-red-100 text-sm">Submit a request for blood units</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Blood Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-red-600" />
                    Blood Type Required *
                  </div>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {bloodTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, bloodType: type })}
                      className={`py-3 px-4 rounded-xl font-bold text-lg transition-all ${
                        formData.bloodType === type
                          ? "bg-red-600 text-white shadow-lg scale-105"
                          : "bg-red-50 text-red-900 hover:bg-red-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Units Needed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-600" />
                    Units Needed *
                  </div>
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, unitsNeeded: Math.max(1, formData.unitsNeeded - 1) })}
                    className="w-12 h-12 bg-red-100 text-red-600 rounded-xl font-bold text-xl hover:bg-red-200 transition-colors"
                  >
                    -
                  </button>
                  <div className="w-20 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-red-900">{formData.unitsNeeded}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, unitsNeeded: Math.min(20, formData.unitsNeeded + 1) })}
                    className="w-12 h-12 bg-red-100 text-red-600 rounded-xl font-bold text-xl hover:bg-red-200 transition-colors"
                  >
                    +
                  </button>
                  <span className="text-gray-500 text-sm ml-2">units</span>
                </div>
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Urgency Level *
                  </div>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {urgencyLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgencyLevel: level })}
                      className={`py-3 px-4 rounded-xl font-medium capitalize transition-all ${
                        formData.urgencyLevel === level
                          ? level === "critical"
                            ? "bg-red-600 text-white"
                            : level === "urgent"
                            ? "bg-orange-500 text-white"
                            : "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Delivery Location *
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  placeholder="Enter delivery address"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-600" />
                    Contact Phone *
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  placeholder="+213555123456"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-600" />
                    Contact Email *
                  </div>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  placeholder="contact@hospital.dz"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={createRequestMutation.isPending}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Droplet className="w-5 h-5" />
                      Submit Blood Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
