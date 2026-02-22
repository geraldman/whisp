"use client";

import { motion } from "framer-motion";

export default function MobileBottomNav({
  mode,
  onMessages,
  onSettings,
  requestCount = 0,
}: {
  mode: 'chat' | 'settings';
  onMessages: () => void;
  onSettings: () => void;
  requestCount?: number;
}) {
  return (
    <div className="md:hidden pointer-events-none fixed bottom-5 left-0 right-0 z-50 flex justify-center">
      {/* FLOATING PILL */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          pointer-events-auto
          flex items-center gap-6
          px-6 py-3
          rounded-full
          bg-[#F8F4E1]/80
          backdrop-blur-xl
          border border-[#74512D]/15
          shadow-[0_20px_40px_rgba(0,0,0,0.18)]
        "
      >
        {/* Messages */}
        <NavIcon label="Messages" active={mode === "chat"} onClick={onMessages}>
          <MessageIcon />
        </NavIcon>

        {/* Settings */}
        <NavIcon label="Settings" active={mode === "settings"} onClick={onSettings} badge={requestCount}>
          <SettingsIcon />
        </NavIcon>
      </motion.div>
    </div>
  );
}

/* ================= NAV ICON ================= */
function NavIcon({
  children,
  active,
  onClick,
  label,
  badge = 0,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        aria-label={label}
        className={`
          cursor-pointer w-11 h-11 rounded-full
          flex items-center justify-center
          transition-all duration-200
          ${
            active
              ? "bg-[#6B4A2E] text-white shadow-md"
              : "text-[#6B4A2E] hover:bg-[#6B4A2E]/10"
          }
        `}
      >
        {children}

        {/* 🔴 BADGE */}
        {badge > 0 && (
            <span
                className="
                    absolute -top-1 -right-1
                    min-w-[16px] h-[16px]
                    px-1
                    rounded-full
                    bg-red-500 text-white
                    text-[10px] font-bold
                    flex items-center justify-center
                    border-2 border-[#F8F4E1]
                    "
                >
                {badge > 9 ? "9+" : badge}    
            </span>
        )}
      </button>

      {/* Tooltip (desktop hover only) */}
      <span
        className="
          pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2
          rounded-md bg-[#543310] px-2 py-0.5 text-[10px] text-white
          opacity-0 group-hover:opacity-100 transition whitespace-nowrap
        "
      >
        {label}
      </span>
    </div>
  );
}

/* ================= ICONS (MATCH SIDEBAR) ================= */

function MessageIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 8h10M7 12h7M5 21l2-2h11a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12z"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}