"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { routes } from "@/app/routes";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    if (loading) return;

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // mock reset process
      await new Promise((r) => setTimeout(r, 1200));
      setSuccess(true);
    } catch {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4E1] px-4 relative overflow-hidden">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute top-4 left-4 sm:top-6 sm:left-8 lg:left-20 z-30"
      >
        <Image
          src="/logo.png"
          alt="WHISPXR Logo"
          width={160}
          height={60}
          className="object-contain w-32 sm:w-36 lg:w-40 h-auto"
          priority
        />
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg"
      >
        {/* Back */}
        <button
          onClick={() => router.push(routes.home)}
          aria-label="Back"
          className="cursor-pointer mb-4 w-9 h-9 rounded-full
                     flex items-center justify-center
                     bg-[#74512D]/10 text-[#74512D]
                     hover:bg-[#74512D]/20 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-semibold text-[#5C3A21] mb-1 text-center"
        >
          Reset Your Password
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-[13px] text-black/70 text-center mb-8"
        >
          Enter your email and we’ll send you a password reset link.
        </motion.p>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm text-[#5C3A21] mb-1">
            Email address
          </label>

          <input
            type="email"
            placeholder="whispxr@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm
                       border border-[#74512D]/20
                       focus:ring-2 focus:ring-[#74512D]/40
                       outline-none transition"
          />
        </div>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-green-600"
            >
              The reset link has been sent to your email.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <button
          onClick={handleReset}
          disabled={loading || !email}
          className="cursor-pointer mt-6 w-full rounded-xl bg-[#74512D] py-3
                     text-white font-medium
                     shadow-md shadow-[#74512D]/30
                     transition-all duration-200 ease-out
                     hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#74512D]/40
                     hover:bg-[#6A4627]
                     active:translate-y-0 active:shadow-sm
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending reset link…" : "Send"}
        </button>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push(routes.login)}
            className="cursor-pointer text-[13px] text-[#74512D]/80
                       hover:text-[#74512D] hover:underline transition"
          >
            Back to login
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-6 w-full text-center"
      >
        <p className="text-xs text-black/40 hover:text-black/70 transition">
          © 2026 WHISPXR • All rights reserved.
        </p>
      </motion.footer>
    </div>
  );
}
