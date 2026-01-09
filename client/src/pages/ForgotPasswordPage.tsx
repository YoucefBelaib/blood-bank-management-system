import { useState } from "react";
import { motion } from "framer-motion";
import { User, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useAuthContext } from "@/features/auth";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { requestPasswordReset, isRequestingReset } = useAuthContext();
  const [username, setUsername] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await requestPasswordReset(username);
      setIsSubmitted(true);
      toast({
        title: "Request Sent",
        description:
          "If an account exists, a password reset link has been sent.",
      });
    } catch (error) {
      // SECURITY: Always show success message to prevent user enumeration
      setIsSubmitted(true);
      toast({
        title: "Request Sent",
        description:
          "If an account exists, a password reset link has been sent.",
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
            Forgot Password
          </h1>
          <p className="text-red-800 mt-2">
            {isSubmitted
              ? "Check for your reset link"
              : "Enter your username to reset your password"}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur"
        >
          {isSubmitted ? (
            // Success state
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
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                If an account exists for <strong>{username}</strong>, we've sent
                a password reset link. The link will expire in 30 minutes.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                In development mode, check the server console for the reset
                link.
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive a link?{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            // Username input form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-red-950 mb-2">
                  <User className="w-4 h-4 text-red-600" />
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full h-12 px-4 border border-red-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={isRequestingReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 gradient-red-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRequestingReset ? (
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-red-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
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
