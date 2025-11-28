import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Lock, Mail, UserPlus, ArrowRight, AlertCircle, Shield, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AnimatedNav } from "@/components/AnimatedNav";
import { BloodDropsAnimation } from "@/components/BloodDrop";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup, user, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"donor" | "admin">("donor");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === "admin" && user.isApproved) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signup(username, password, email || undefined, role);
      if (role === "admin") {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white overflow-hidden">
      <AnimatedNav />
      <BloodDropsAnimation />

      <section className="relative min-h-screen flex items-center justify-center py-20 pt-32">
        <motion.div
          className="container mx-auto px-6 relative z-10 max-w-md"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 gradient-red-primary rounded-full mx-auto flex items-center justify-center shadow-xl"
                >
                  <UserPlus className="w-10 h-10 text-white" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-gradient-red">Join VitaBlood</CardTitle>
                <CardDescription className="text-red-800">
                  Create your account and start saving lives
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-100 border border-red-300 rounded-xl flex items-center gap-3 text-red-800"
                    >
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRole("donor")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        role === "donor"
                          ? "border-red-600 bg-red-50 text-red-800"
                          : "border-red-200 bg-white text-red-600 hover:border-red-400"
                      }`}
                    >
                      <Heart className="w-6 h-6" />
                      <span className="font-semibold">Donor</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRole("admin")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        role === "admin"
                          ? "border-red-600 bg-red-50 text-red-800"
                          : "border-red-200 bg-white text-red-600 hover:border-red-400"
                      }`}
                    >
                      <Shield className="w-6 h-6" />
                      <span className="font-semibold">Hospital Admin</span>
                    </motion.button>
                  </div>

                  {role === "admin" && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-red-700 bg-red-50 p-3 rounded-lg"
                    >
                      Admin accounts require approval from an existing admin before you can access admin features.
                    </motion.p>
                  )}

                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-red-50 to-white rounded-xl p-4 shadow-sm"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                        <User className="w-4 h-4 text-red-600" />
                        Username <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                        required
                        minLength={3}
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-red-50 to-white rounded-xl p-4 shadow-sm"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                        <Mail className="w-4 h-4 text-red-600" />
                        Email (optional)
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-red-50 to-white rounded-xl p-4 shadow-sm"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                        <Lock className="w-4 h-4 text-red-600" />
                        Password <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="h-12 border-red-200 focus:border-red-600 focus:ring-red-600 bg-white"
                        required
                        minLength={6}
                      />
                    </motion.div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="w-full py-4 gradient-red-primary text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-red-800">
                    Already have an account?{" "}
                    <a href="/login" className="text-red-600 font-semibold hover:underline">
                      Sign in here
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
