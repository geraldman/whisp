'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';

type AlertType = 'success' | 'error' | null;

export default function ProfileContent({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: AlertType;
    message: string;
  } | null>(null);

  async function handleDeleteAccount() {
    if (loading) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    setAlert(null);
    setLoading(true);

    try {
      // TODO: Implement account deletion
      await new Promise((res) => setTimeout(res, 1000));

      setAlert({
        type: 'success',
        message: 'Account deletion initiated',
      });
    } catch {
      setAlert({
        type: 'error',
        message: 'Failed to delete account',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
  className="
    flex-1 min-h-0 overflow-y-auto
    bg-[#F6F1E3]
    px-4 sm:px-6 md:px-8
    py-6 sm:py-8 md:py-10
    pb-32 md:pb-10
  "
>
      {/* Back Button - Mobile Only */}
      <button
        type="button"
        onClick={onBack}
        className="md:hidden cursor-pointer mb-4 w-9 h-9 rounded-full flex items-center justify-center
              bg-[#74512D]/10 text-[#74512D]
              hover:bg-[#74512D]/20 active:scale-95 transition"
        aria-label="Back"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M15 18l-6-6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="max-w-xl mx-auto">

        {/* AVATAR */}
        <div className="relative flex justify-center z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                          rounded-full bg-white border border-[#74512D]/25
                          flex items-center justify-center shadow-sm">
            <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#543310]">
              {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </span>
          </div>
        </div>

        {/* CARD */}
        <div className="relative mt-[-32px] sm:mt-[-36px] md:mt-[-40px]
                pt-12 sm:pt-14 md:pt-16
                px-4 sm:px-6 md:px-8
                pb-6 sm:pb-7 md:pb-8
                rounded-2xl sm:rounded-3xl
                bg-[#EFE6D8]
                shadow-[0_14px_32px_rgba(0,0,0,0.1)]">

          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-12 bg-[#F6F1E3] rounded-b-full" />

          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-[#543310]">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-sm text-[#74512D]/70">
              ID · {(user as any)?.numericId || '00000000'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div className="rounded-xl bg-white/70 border border-[#74512D]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#74512D]/60 mb-1">
                Username
              </p>
              <p className="text-sm text-[#543310] font-medium">
                {user?.displayName || user?.email?.split('@')[0] || 'Not set'}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-xl bg-white/70 border border-[#74512D]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#74512D]/60 mb-1">
                Email
              </p>
              <p className="text-sm text-[#543310] font-medium break-all">
                {user?.email || 'No email'}
              </p>
            </div>

            {/* UID */}
            <div className="rounded-xl bg-white/70 border border-[#74512D]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#74512D]/60 mb-1">
                User ID (UID)
              </p>
              <p className="text-xs text-[#543310] font-mono break-all">
                {user?.uid || 'Loading...'}
              </p>
            </div>
          </div>

          {/* ALERT */}
          <AnimatePresence>
            {alert && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 text-sm text-center ${
                  alert.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {alert.message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* ACTION */}
          <div className="mt-8">
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="cursor-pointer w-full py-3 rounded-xl
                         border border-red-500/25
                         text-red-600 text-sm font-medium
                         hover:bg-red-50
                         active:scale-[0.98]
                         transition
                         disabled:opacity-60
                         disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
