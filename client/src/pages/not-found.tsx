import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function NotFound() {
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
            <AlertCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-red">
            404 Page Not Found
          </h1>
          <p className="text-red-800 mt-2">
            Did you forget to add the page to the router?
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur text-center"
        >
          <p className="text-red-700 font-semibold">
            The page you're looking for doesn't exist.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors font-semibold"
          >
            Back to VitaBlood
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
