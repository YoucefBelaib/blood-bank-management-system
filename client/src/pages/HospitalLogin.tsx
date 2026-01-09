import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, Lock, ArrowRight, Droplet } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { BloodDropsAnimation } from "@/components/BloodDrop";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useHospitalAuth } from "@/features/hospitals";

export default function HospitalLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useHospitalAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const hospital = await login(email, password);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${hospital.name}!`,
      });
      setLocation("/hospital/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white overflow-hidden flex items-center justify-center">
      <BloodDropsAnimation fullScreen={true} />
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-100 opacity-60" />

      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Logo */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 gradient-red-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl"
          >
            <Building2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-red">
            Hospital Portal
          </h1>
          <p className="text-red-800 mt-2">Sign in to access your dashboard</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                <Mail className="w-4 h-4 text-red-600" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hospital@example.com"
                className="w-full h-12 px-4 border border-red-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                <Lock className="w-4 h-4 text-red-600" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 px-4 border border-red-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                required
              />
              <div className="mt-2 text-right">
                <Link
                  href="/hospital/forgot-password"
                  className="text-sm text-red-600 hover:text-red-800 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoggingIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 gradient-red-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-red-100 text-center">
            <p className="text-sm text-red-800">
              Don't have an account? Contact the administrator.
            </p>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div variants={fadeInUp} className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
          >
            <Droplet className="w-4 h-4" />
            Back to VitaBlood
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
