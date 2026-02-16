"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/context/AuthContext";

type ContactInfoProps = {
  onClose: () => void;
};

export default function ContactInfo({ onClose }: ContactInfoProps) {
  const { user } = useAuth();
  
  // Get user display info
  const username = user?.displayName || user?.email?.split('@')[0] || 'User';
  const userInitial = username[0]?.toUpperCase() || 'U';
  const userId = (user as any)?.numericId || '00000000';

  return (
    <div className="absolute inset-0 z-50">
      {/* OVERLAY */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/25"
        onClick={onClose}
      />

      {/* SIDE SHEET */}
      <motion.div
        initial={{ x: 360 }}
        animate={{ x: 0 }}
        exit={{ x: 360 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute right-0 top-0 w-[360px] h-full bg-[#F6F1E3]
                   shadow-[-8px_0_24px_rgba(0,0,0,0.18)]
                   flex flex-col"
      >
        {/* HEADER */}
        <div className="px-5 h-14 flex items-center justify-between
                        border-b border-[#74512D]/10">
          <p className="text-sm font-semibold text-[#543310]">
            Contact Info
          </p>

          <button
            onClick={onClose}
            className="cursor-pointer w-8 h-8 flex items-center justify-center
                       rounded-full text-[#74512D]
                       hover:bg-[#E6D5BC] transition"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* PROFILE */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-24 h-24 rounded-full bg-white
                         border border-[#74512D]/20
                         flex items-center justify-center mb-3"
            >
              <span className="text-3xl font-semibold text-[#543310]">
                {userInitial}
              </span>
            </div>

            <p className="text-lg font-semibold text-[#543310]">
              {username}
            </p>

            <div
              className="mt-2 px-3 py-1 rounded-full
                         bg-[#E6D5BC]/60
                         text-[11px] text-[#74512D]"
            >
              ID · {userId}
            </div>
          </div>

          {/* BIO */}
          <div
            className="mb-6 rounded-2xl bg-white/70
                       border border-[#74512D]/10 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-full rounded-full bg-[#74512D]/60" />
              <div>
                <p className="text-xs uppercase tracking-wide
                              text-[#74512D]/60 mb-1">
                  Email
                </p>
                <p className="text-sm text-[#543310] leading-relaxed">
                  {user?.email || 'No email available'}
                </p>
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div
            className="mb-8 rounded-2xl bg-white/60
                       border border-[#74512D]/10 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-full rounded-full bg-[#74512D]/40" />
              <div>
                <p className="text-xs uppercase tracking-wide
                              text-[#74512D]/60 mb-1">
                  User ID
                </p>
                <p className="text-sm text-[#543310]/85 leading-relaxed">
                  {user?.uid || 'Loading...'}
                </p>
              </div>
            </div>
          </div>

          {/* DELETE */}
          <button
            className="cursor-pointer w-full py-3 rounded-xl
                       border border-red-500/25
                       text-red-600 text-sm font-medium
                       hover:bg-red-50
                       active:scale-[0.98]
                       transition"
          >
            Delete friend
          </button>
        </div>
      </motion.div>
    </div>
  );
}
