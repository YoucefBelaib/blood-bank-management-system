import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, User } from "lucide-react";
import { useAuthContext } from "@/features/auth";
import { Link, useLocation } from "wouter";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function LoginPage() {
  const { login, user, isLoading } = useAuthContext();
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && user && (pendingRedirect || !isSubmitting)) {
      setLocation("/admin");
      setPendingRedirect(false);
    }
  }, [user, isLoading, pendingRedirect, isSubmitting, setLocation]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setPendingRedirect(false);

    try {
      await login(username.trim(), password);
      setPendingRedirect(true);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "Login failed";
      const friendly = rawMessage.includes("awaiting approval")
        ? "Your account is awaiting approval by an administrator."
        : rawMessage;
      setError(friendly);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-100 opacity-60" />

      <motion.div
        className="relative z-10 w-full max-w-md mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 gradient-red-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-red">Admin Portal</h1>
          <p className="text-red-800 mt-2">Sign in to manage VitaBlood</p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur"
        >
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                <User className="w-4 h-4 text-red-600" />
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                className="w-full h-12 px-4 border border-red-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
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
                autoComplete="current-password"
                required
                className="w-full h-12 px-4 border border-red-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
              />
            </div>

            {error && (
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <span className="font-semibold">Error:</span>
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting || isLoading}
              whileHover={{ scale: isSubmitting || isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting || isLoading ? 1 : 0.98 }}
              className="w-full h-14 gradient-red-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
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
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-red-600 font-semibold hover:text-red-800 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
          >
            Back to VitaBlood
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
