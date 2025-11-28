import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Heart, Clock, Check, X, AlertCircle, LogOut, User, Droplet, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AnimatedNav } from "@/components/AnimatedNav";
import { BloodDropsAnimation } from "@/components/BloodDrop";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface DonorDashboardData {
  donations: Array<{
    id: string;
    fullName: string;
    bloodType: string;
    status: string;
    createdAt: string;
    approvedAt?: string;
  }>;
}

export default function DonorDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout, isAdmin } = useAuth();

  const { data: dashboard, isLoading } = useQuery<DonorDashboardData>({
    queryKey: ["donor", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/donor/dashboard", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    } else if (!authLoading && isAdmin) {
      setLocation("/admin");
    }
  }, [user, authLoading, isAdmin, setLocation]);

  if (authLoading || isLoading || !user) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white overflow-hidden">
      <AnimatedNav />
      <BloodDropsAnimation />

      <div className="pt-24 pb-12 px-6 relative z-10">
        <motion.div
          className="container mx-auto max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient-red mb-2">My Dashboard</h1>
              <p className="text-red-800">Welcome, {user.username}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>

          {user.role === "admin" && !user.isApproved && (
            <motion.div variants={fadeInUp} className="mb-8">
              <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Admin Approval Pending</h3>
                      <p className="text-yellow-700 text-sm">
                        Your admin account is pending approval. You'll have access to admin features once approved by an existing admin.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeInUp} className="mb-8">
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="border-b border-red-100">
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <User className="w-5 h-5 text-red-600" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-xl">
                    <p className="text-sm text-red-600 mb-1">Username</p>
                    <p className="font-semibold text-red-950">{user.username}</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-xl">
                    <p className="text-sm text-red-600 mb-1">Account Type</p>
                    <p className="font-semibold text-red-950 capitalize">{user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="border-b border-red-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-red-950">
                    <Heart className="w-5 h-5 text-red-600" />
                    My Donation Requests
                  </CardTitle>
                  <a href="/donate">
                    <Button className="gradient-red-primary text-white">
                      <Droplet className="w-4 h-4 mr-2" />
                      New Donation
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {dashboard?.donations.length === 0 ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 gradient-red-soft rounded-full mx-auto mb-6 flex items-center justify-center"
                    >
                      <Heart className="w-10 h-10 text-red-600" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-red-950 mb-2">No Donations Yet</h3>
                    <p className="text-red-800 mb-6">Start your journey to save lives by registering as a donor.</p>
                    <a href="/donate">
                      <Button className="gradient-red-primary text-white">
                        Register to Donate
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboard?.donations.map((donation) => (
                      <motion.div
                        key={donation.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-5 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 gradient-red-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
                              {donation.bloodType}
                            </div>
                            <div>
                              <p className="font-semibold text-red-950">{donation.fullName}</p>
                              <p className="text-sm text-red-800">
                                Submitted: {new Date(donation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(donation.status)}`}>
                            {getStatusIcon(donation.status)}
                            <span className="font-medium capitalize">{donation.status}</span>
                          </div>
                        </div>
                        {donation.approvedAt && (
                          <p className="mt-3 text-sm text-red-600 pl-[4.5rem]">
                            {donation.status === "approved" ? "Approved" : "Reviewed"} on: {new Date(donation.approvedAt).toLocaleDateString()}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
