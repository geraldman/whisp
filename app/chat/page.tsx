"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Backend error handling logic
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "notfound") {
      setErrorMessage("Chat not found. The chat may have been deleted due to inactivity.");
      
      // Clear error message after 5 seconds
      const timeout = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      return () => clearTimeout(timeout);
    } else if (error === "expired") {
      setErrorMessage("This chat expired due to inactivity. Select it again to recreate with new encryption keys.");
      
      // Clear error message after 6 seconds
      const timeout = setTimeout(() => {
        setErrorMessage(null);
      }, 6000);

      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  const username = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="relative h-full flex items-center justify-center overflow-hidden bg-[#AF8F6F]/20">
      {/* Soft background accents (FRONTEND) */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#74512D]/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#AF8F6F]/15 blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-sm px-4">
        {/* Error Message (BACKEND LOGIC) */}
        {errorMessage && (
          <div className="mb-6 px-5 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            {errorMessage}
          </div>
        )}

        {/* Welcome Message (FRONTEND) */}
        <h1 className="text-2xl font-semibold text-[#2B1B12] mb-3">
          Welcome, {username}
        </h1>

        <p className="text-sm text-[#8A7F73] mb-8 leading-relaxed">
          Select a chat to start a private conversation.
        </p>

        {/* Encryption Badge (FRONTEND) */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2
                     rounded-full bg-white/70
                     border border-[#74512D]/10
                     shadow-sm text-xs text-[#74512D]"
        >
          🔒 End-to-end encrypted messaging
        </div>
      </div>
    </div>
  );
}
