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
    <div className="h-full overflow-y-auto bg-[#F6F1E3] px-8 py-10">
      {/* Back Button - Mobile Only */}
      <button
        onClick={onBack}
        className="md:hidden mb-6 flex items-center gap-2 text-[#74512D] hover:text-[#543310] transition"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="max-w-xl mx-auto">

        {/* AVATAR */}
        <div className="relative flex justify-center z-10">
          <div className="w-28 h-28 rounded-full bg-white border border-[#74512D]/25 flex items-center justify-center shadow-sm">
            <span className="text-4xl font-semibold text-[#543310]">
              {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </span>
          </div>
        </div>

        {/* CARD */}
        <div className="relative mt-[-40px] pt-16 px-8 pb-8 rounded-3xl bg-[#EFE6D8] shadow-[0_14px_32px_rgba(0,0,0,0.1)]">

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
