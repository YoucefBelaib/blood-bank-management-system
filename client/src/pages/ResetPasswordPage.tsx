import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useAuthContext } from "@/features/auth";

type PageState = "loading" | "valid" | "invalid" | "success";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();
  const { validateResetToken, resetPassword, isResettingPassword } =
    useAuthContext();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Redirect to login after successful password reset
  useEffect(() => {
    if (pageState === "success") {
      const timer = setTimeout(() => {
        setLocation("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pageState, setLocation]);

  // Extract token from URL and validate it
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const tokenFromUrl = urlParams.get("token");

    if (!tokenFromUrl) {
      setPageState("invalid");
      return;
    }

    setToken(tokenFromUrl);

    // Validate token with backend
    validateResetToken(tokenFromUrl)
      .then((result) => {
        setPageState(result.valid ? "valid" : "invalid");
      })
      .catch(() => {
        setPageState("invalid");
      });
  }, [searchParams, validateResetToken]);

  const validatePasswords = (): boolean => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setPageState("success");
      toast({
        title: "Password Reset Successfully",
        description: "You can now log in with your new password.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description:
          error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
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
        {/* Logo */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 gradient-red-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-red">
            Reset Password
          </h1>
          <p className="text-red-800 mt-2">
            {pageState === "loading" && "Validating your reset link..."}
            {pageState === "valid" && "Enter your new password"}
            {pageState === "invalid" && "Invalid or expired link"}
            {pageState === "success" && "Password reset successful!"}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur"
        >
          {/* Loading State */}
          {pageState === "loading" && (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full mx-auto"
              />
              <p className="mt-4 text-gray-600">
                Validating your reset link...
              </p>
            </div>
          )}

          {/* Invalid Token State */}
          {pageState === "invalid" && (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid or Expired Link
              </h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please
                request a new reset link.
              </p>
              <Link href="/forgot-password">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 gradient-red-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  Request New Link
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          )}

          {/* Valid Token - Password Form */}
          {pageState === "valid" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                  <Lock className="w-4 h-4 text-red-600" />
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Enter new password"
                  className="w-full h-12 px-4 border border-red-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                  <Lock className="w-4 h-4 text-red-600" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Confirm new password"
                  className="w-full h-12 px-4 border border-red-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>

              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {passwordError}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isResettingPassword}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 gradient-red-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResettingPassword ? (
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
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Success State */}
          {pageState === "success" && (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Password Reset Complete
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. Redirecting to
                login...
              </p>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 gradient-red-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  Go to Login
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          )}

          {pageState !== "success" && (
            <div className="mt-6 pt-6 border-t border-red-100 text-center">
              <Link
                href="/login"
                className="text-red-600 hover:text-red-800 transition-colors font-semibold"
              >
                Back to Login
              </Link>
            </div>
          )}
        </motion.div>

        {/* Back to home */}
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
