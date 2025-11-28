import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Droplet, Building2, Activity, Plus, Minus, Check, X, 
  Shield, Clock, TrendingUp, AlertCircle, LogOut, Heart, BarChart3,
  Calendar, FileText, Settings, ChevronRight, Layers
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AnimatedNav } from "@/components/AnimatedNav";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface DashboardData {
  statistics: {
    activeDonors: number;
    totalBloodUnits: number;
    partnerHospitals: number;
  };
  inventory: Array<{
    id: string;
    bloodType: string;
    unitsAvailable: number;
    status: string;
    lastUpdated: string;
  }>;
  donors: Array<{
    id: string;
    fullName: string;
    bloodType: string;
    status: string;
    createdAt: string;
    approvedAt?: string;
  }>;
  pendingDonors: Array<{
    id: string;
    fullName: string;
    bloodType: string;
    phone: string;
    email: string;
    createdAt: string;
  }>;
  pendingAdmins: Array<{
    id: string;
    username: string;
    email?: string;
    createdAt: string;
  }>;
  requests: Array<{
    id: string;
    hospitalName: string;
    bloodType: string;
    unitsNeeded: number;
    urgencyLevel: string;
    status: string;
    createdAt: string;
  }>;
  inventoryLogs: Array<{
    id: string;
    bloodType: string;
    changeAmount: number;
    previousUnits: number;
    newUnits: number;
    reason?: string;
    createdAt: string;
  }>;
}

type TabType = "overview" | "donors" | "requests" | "admins" | "inventory" | "approved" | "logs";

const sidebarItems: { id: TabType; label: string; icon: any }[] = [
  { id: "overview", label: "Statistics", icon: BarChart3 },
  { id: "donors", label: "Donor Requests", icon: Heart },
  { id: "requests", label: "Blood Requests", icon: Droplet },
  { id: "admins", label: "Admin Approvals", icon: Shield },
  { id: "inventory", label: "Blood Inventory", icon: Layers },
  { id: "approved", label: "Approved Donations", icon: Check },
  { id: "logs", label: "Activity Logs", icon: FileText },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    enabled: isAdmin,
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ bloodType, changeAmount, reason }: { bloodType: string; changeAmount: number; reason?: string }) => {
      const res = await fetch(`/api/admin/inventory/${encodeURIComponent(bloodType)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ changeAmount, reason }),
      });
      if (!res.ok) throw new Error("Failed to update inventory");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const approveDonorMutation = useMutation({
    mutationFn: async (donorId: string) => {
      const res = await fetch(`/api/admin/donors/${donorId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve donor");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const rejectDonorMutation = useMutation({
    mutationFn: async (donorId: string) => {
      const res = await fetch(`/api/admin/donors/${donorId}/reject`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject donor");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const approveAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve admin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/admin/requests/${requestId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/admin/requests/${requestId}/reject`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      setLocation("/login");
    }
  }, [user, authLoading, isAdmin, setLocation]);

  if (authLoading || isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleInventoryUpdate = (bloodType: string, change: number) => {
    updateInventoryMutation.mutate({ bloodType, changeAmount: change });
  };

  const pendingDonors = dashboard?.pendingDonors || [];
  const pendingRequests = dashboard?.requests?.filter(r => r.status === "pending") || [];
  const pendingAdmins = dashboard?.pendingAdmins || [];
  const approvedDonors = dashboard?.donors?.filter(d => d.status === "approved") || [];

  const donationsByBloodType = dashboard?.donors?.reduce((acc, donor) => {
    acc[donor.bloodType] = (acc[donor.bloodType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const approvedDonationsByBloodType = approvedDonors.reduce((acc, donor) => {
    acc[donor.bloodType] = (acc[donor.bloodType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const donationsByDate = dashboard?.donors?.reduce((acc, donor) => {
    const date = new Date(donor.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const sortedDates = Object.entries(donationsByDate)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-white shadow-lg border-0" data-testid="stat-active-donors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 gradient-red-primary rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-red-800 text-sm">Active Donors</p>
                      <p className="text-3xl font-bold text-red-950">{dashboard?.statistics.activeDonors || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0" data-testid="stat-blood-units">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 gradient-red-primary rounded-xl flex items-center justify-center">
                      <Droplet className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-red-800 text-sm">Total Blood Units</p>
                      <p className="text-3xl font-bold text-red-950">{dashboard?.statistics.totalBloodUnits || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0" data-testid="stat-hospitals">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 gradient-red-primary rounded-xl flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-red-800 text-sm">Partner Hospitals</p>
                      <p className="text-3xl font-bold text-red-950">{dashboard?.statistics.partnerHospitals || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0" data-testid="stat-pending">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-red-800 text-sm">Pending Approvals</p>
                      <p className="text-3xl font-bold text-red-950">{pendingDonors.length + pendingRequests.length + pendingAdmins.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-950">
                    <BarChart3 className="w-5 h-5 text-red-600" />
                    Donations by Blood Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {bloodTypes.map(type => (
                      <motion.div
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        className="p-4 bg-gradient-to-br from-red-50 to-white rounded-xl text-center border border-red-100"
                        data-testid={`stat-blood-type-${type}`}
                      >
                        <div className="w-12 h-12 gradient-red-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold text-sm">{type}</span>
                        </div>
                        <p className="text-2xl font-bold text-red-950">{donationsByBloodType[type] || 0}</p>
                        <p className="text-xs text-red-600">Total Registrations</p>
                        <p className="text-lg font-semibold text-green-600 mt-1">{approvedDonationsByBloodType[type] || 0}</p>
                        <p className="text-xs text-green-600">Approved</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-950">
                    <Calendar className="w-5 h-5 text-red-600" />
                    Peak Donation Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedDates.length === 0 ? (
                    <p className="text-red-800 text-center py-8">No donation data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {sortedDates.map(([date, count], index) => (
                        <motion.div
                          key={date}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl"
                          data-testid={`peak-day-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              index === 0 ? "gradient-red-primary" : "bg-red-100"
                            }`}>
                              <Calendar className={`w-5 h-5 ${index === 0 ? "text-white" : "text-red-600"}`} />
                            </div>
                            <span className="font-medium text-red-950">{date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-red-600">{count}</span>
                            <span className="text-sm text-red-800">donations</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <Layers className="w-5 h-5 text-red-600" />
                  Blood Inventory Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {dashboard?.inventory.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl text-center border-2 ${
                        item.status === "Critical" ? "border-red-600 bg-red-50" :
                        item.status === "Low" ? "border-yellow-500 bg-yellow-50" : "border-green-500 bg-green-50"
                      }`}
                      data-testid={`inventory-overview-${item.bloodType}`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                        item.status === "Critical" ? "bg-red-600" :
                        item.status === "Low" ? "bg-yellow-500" : "bg-green-500"
                      }`}>
                        <span className="text-white font-bold">{item.bloodType}</span>
                      </div>
                      <p className="text-3xl font-bold text-red-950">{item.unitsAvailable}</p>
                      <p className="text-sm text-red-800">units</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Critical" ? "bg-red-200 text-red-800" :
                        item.status === "Low" ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800"
                      }`}>
                        {item.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-950">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl">
                      <span className="text-red-800">Total Donor Registrations</span>
                      <span className="text-2xl font-bold text-red-950">{dashboard?.donors?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-xl">
                      <span className="text-green-800">Approved Donors</span>
                      <span className="text-2xl font-bold text-green-600">{approvedDonors.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl">
                      <span className="text-yellow-800">Pending Donors</span>
                      <span className="text-2xl font-bold text-yellow-600">{pendingDonors.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl">
                      <span className="text-blue-800">Total Blood Requests</span>
                      <span className="text-2xl font-bold text-blue-600">{dashboard?.requests?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-950">
                    <Activity className="w-5 h-5 text-red-600" />
                    Request Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl">
                      <span className="text-red-800">Urgent Requests</span>
                      <span className="text-2xl font-bold text-red-600">
                        {dashboard?.requests?.filter(r => r.urgencyLevel === "critical").length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl">
                      <span className="text-yellow-800">Pending Requests</span>
                      <span className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-xl">
                      <span className="text-green-800">Fulfilled Requests</span>
                      <span className="text-2xl font-bold text-green-600">
                        {dashboard?.requests?.filter(r => r.status === "approved").length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                      <span className="text-gray-800">Rejected Requests</span>
                      <span className="text-2xl font-bold text-gray-600">
                        {dashboard?.requests?.filter(r => r.status === "rejected").length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case "donors":
        return (
          <motion.div
            key="donors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <Heart className="w-5 h-5 text-red-600" />
                  Pending Donor Requests ({pendingDonors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDonors.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-red-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Check className="w-10 h-10 text-red-300" />
                    </div>
                    <p className="text-red-800">No pending donor requests</p>
                    <p className="text-sm text-red-600 mt-1">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDonors.map((donor) => (
                      <motion.div
                        key={donor.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100"
                        data-testid={`pending-donor-${donor.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 gradient-red-primary rounded-xl flex items-center justify-center text-white font-bold">
                            {donor.bloodType}
                          </div>
                          <div>
                            <p className="font-semibold text-red-950 text-lg">{donor.fullName}</p>
                            <p className="text-sm text-red-800">{donor.email}</p>
                            <p className="text-xs text-red-600">{donor.phone} • {new Date(donor.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            className="gradient-red-primary text-white px-6"
                            onClick={() => approveDonorMutation.mutate(donor.id)}
                            disabled={approveDonorMutation.isPending}
                            data-testid={`approve-donor-${donor.id}`}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => rejectDonorMutation.mutate(donor.id)}
                            disabled={rejectDonorMutation.isPending}
                            data-testid={`reject-donor-${donor.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case "requests":
        return (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <Droplet className="w-5 h-5 text-red-600" />
                  Pending Blood Requests ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-red-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Droplet className="w-10 h-10 text-red-300" />
                    </div>
                    <p className="text-red-800">No pending blood requests</p>
                    <p className="text-sm text-red-600 mt-1">All requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-5 rounded-xl border-2 ${
                          request.urgencyLevel === "critical" ? "border-red-500 bg-red-50" :
                          request.urgencyLevel === "high" ? "border-orange-400 bg-orange-50" : "border-yellow-400 bg-yellow-50"
                        }`}
                        data-testid={`pending-request-${request.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold ${
                              request.urgencyLevel === "critical" ? "bg-red-600" :
                              request.urgencyLevel === "high" ? "bg-orange-500" : "bg-yellow-500"
                            }`}>
                              {request.bloodType}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-red-950 text-lg">{request.hospitalName}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${
                                  request.urgencyLevel === "critical" ? "bg-red-200 text-red-800" :
                                  request.urgencyLevel === "high" ? "bg-orange-200 text-orange-800" : "bg-yellow-200 text-yellow-800"
                                }`}>
                                  {request.urgencyLevel}
                                </span>
                              </div>
                              <p className="text-sm text-red-800">{request.unitsNeeded} units needed</p>
                              <p className="text-xs text-red-600">{new Date(request.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              className="gradient-red-primary text-white px-6"
                              onClick={() => approveRequestMutation.mutate(request.id)}
                              disabled={approveRequestMutation.isPending}
                              data-testid={`approve-request-${request.id}`}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Fulfill
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => rejectRequestMutation.mutate(request.id)}
                              disabled={rejectRequestMutation.isPending}
                              data-testid={`reject-request-${request.id}`}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <FileText className="w-5 h-5 text-red-600" />
                  All Blood Requests ({dashboard?.requests?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dashboard?.requests?.map((request) => (
                    <div
                      key={request.id}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        request.status === "approved" ? "bg-green-50 border border-green-200" :
                        request.status === "rejected" ? "bg-gray-50 border border-gray-200" : "bg-yellow-50 border border-yellow-200"
                      }`}
                      data-testid={`request-${request.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-red-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {request.bloodType}
                        </div>
                        <div>
                          <p className="font-medium text-red-950">{request.hospitalName}</p>
                          <p className="text-xs text-red-600">{request.unitsNeeded} units • {new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        request.status === "approved" ? "bg-green-200 text-green-800" :
                        request.status === "rejected" ? "bg-gray-200 text-gray-800" : "bg-yellow-200 text-yellow-800"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "admins":
        return (
          <motion.div
            key="admins"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <Shield className="w-5 h-5 text-red-600" />
                  Pending Admin Approvals ({pendingAdmins.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingAdmins.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-red-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Shield className="w-10 h-10 text-red-300" />
                    </div>
                    <p className="text-red-800">No pending admin approvals</p>
                    <p className="text-sm text-red-600 mt-1">All admin requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAdmins.map((admin) => (
                      <motion.div
                        key={admin.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100"
                        data-testid={`pending-admin-${admin.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                            <Shield className="w-7 h-7 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-red-950 text-lg">{admin.username}</p>
                            <p className="text-sm text-red-800">{admin.email || "No email provided"}</p>
                            <p className="text-xs text-red-600">Requested: {new Date(admin.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button
                          className="gradient-red-primary text-white px-6"
                          onClick={() => approveAdminMutation.mutate(admin.id)}
                          disabled={approveAdminMutation.isPending}
                          data-testid={`approve-admin-${admin.id}`}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve Admin
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case "inventory":
        return (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <Layers className="w-5 h-5 text-red-600" />
                  Blood Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard?.inventory.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100"
                      data-testid={`inventory-item-${item.bloodType}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-white text-lg ${
                          item.status === "Critical" ? "bg-red-700" :
                          item.status === "Low" ? "bg-yellow-500" : "gradient-red-primary"
                        }`}>
                          {item.bloodType}
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-red-950">{item.unitsAvailable}</p>
                          <p className="text-sm text-red-800">units available</p>
                          <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium ${
                            item.status === "Critical" ? "bg-red-200 text-red-800" :
                            item.status === "Low" ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 w-12 h-12"
                          onClick={() => handleInventoryUpdate(item.bloodType, -5)}
                          disabled={updateInventoryMutation.isPending}
                          data-testid={`inventory-minus5-${item.bloodType}`}
                        >
                          -5
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 w-12 h-12"
                          onClick={() => handleInventoryUpdate(item.bloodType, -1)}
                          disabled={updateInventoryMutation.isPending}
                          data-testid={`inventory-minus1-${item.bloodType}`}
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                        <Button
                          size="lg"
                          className="gradient-red-primary text-white w-12 h-12"
                          onClick={() => handleInventoryUpdate(item.bloodType, 1)}
                          disabled={updateInventoryMutation.isPending}
                          data-testid={`inventory-plus1-${item.bloodType}`}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                        <Button
                          size="lg"
                          className="gradient-red-primary text-white w-12 h-12"
                          onClick={() => handleInventoryUpdate(item.bloodType, 5)}
                          disabled={updateInventoryMutation.isPending}
                          data-testid={`inventory-plus5-${item.bloodType}`}
                        >
                          +5
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "approved":
        return (
          <motion.div
            key="approved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <Check className="w-5 h-5 text-green-600" />
                  Approved Donations ({approvedDonors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedDonors.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Heart className="w-10 h-10 text-green-300" />
                    </div>
                    <p className="text-red-800">No approved donations yet</p>
                    <p className="text-sm text-red-600 mt-1">Approved donors will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {approvedDonors.map((donor) => (
                      <motion.div
                        key={donor.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200"
                        data-testid={`approved-donor-${donor.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {donor.bloodType}
                          </div>
                          <div>
                            <p className="font-semibold text-red-950 text-lg">{donor.fullName}</p>
                            <p className="text-sm text-green-700">Registered: {new Date(donor.createdAt).toLocaleDateString()}</p>
                            {donor.approvedAt && (
                              <p className="text-xs text-green-600">Approved: {new Date(donor.approvedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <span className="px-4 py-2 rounded-full bg-green-200 text-green-800 font-medium flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Active Donor
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case "logs":
        return (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <Clock className="w-5 h-5 text-red-600" />
                  Recent Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.inventoryLogs.length === 0 ? (
                  <p className="text-red-800 text-center py-12">No activity logs yet</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {dashboard?.inventoryLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100"
                        data-testid={`log-${log.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            log.changeAmount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}>
                            {log.changeAmount > 0 ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-medium text-red-950">
                              {log.bloodType}: {log.previousUnits} → {log.newUnits} units
                            </p>
                            <p className="text-xs text-red-600">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                            {log.reason && (
                              <p className="text-xs text-red-500 mt-1">Reason: {log.reason}</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-xl font-bold ${log.changeAmount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {log.changeAmount > 0 ? "+" : ""}{log.changeAmount}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
      <AnimatedNav />

      <div className="pt-20 flex">
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-72 min-h-[calc(100vh-5rem)] bg-white shadow-xl border-r border-red-100 fixed left-0 top-20 overflow-y-auto"
          data-testid="admin-sidebar"
        >
          <div className="p-6 border-b border-red-100">
            <h2 className="text-xl font-bold text-gradient-red">Admin Panel</h2>
            <p className="text-sm text-red-600 mt-1">Welcome, {user.username}</p>
          </div>

          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const count = 
                item.id === "donors" ? pendingDonors.length :
                item.id === "requests" ? pendingRequests.length :
                item.id === "admins" ? pendingAdmins.length :
                item.id === "approved" ? approvedDonors.length : 0;

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 5 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    activeTab === item.id
                      ? "gradient-red-primary text-white shadow-lg"
                      : "text-red-800 hover:bg-red-50"
                  }`}
                  data-testid={`sidebar-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === item.id ? "bg-white text-red-600" : "bg-red-100 text-red-600"
                    }`}>
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-red-100 mt-auto">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.aside>

        <main className="ml-72 flex-1 p-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-6xl"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <h1 className="text-3xl font-bold text-gradient-red mb-2">
                {sidebarItems.find(i => i.id === activeTab)?.label || "Dashboard"}
              </h1>
              <p className="text-red-800">Manage your blood donation platform</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
