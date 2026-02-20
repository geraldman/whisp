"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { useSidebar } from "@/lib/context/SidebarContext";
import LoadingScreen from "@/app/components/LoadingScreenFixed";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { user, loading } = useRequireAuth();
  const { toggleSidebar } = useSidebar();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (loading || !user) {
    return <LoadingScreen />;
  }

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
    <div className="relative h-full flex flex-col bg-[#AF8F6F]/20">
      {/* Mobile Header */}
      <div className="md:hidden h-14 px-3 flex items-center gap-3 border-b border-[#74512D]/15 bg-[#F8F4E1]">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 flex items-center justify-center rounded-lg
                     text-[#74512D] hover:bg-[#E6D5BC] transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img
          src="/logo.png"
          alt="WHISPXR"
          className="h-6 object-contain"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Soft background accents (FRONTEND) */}
        <div className="absolute -top-32 -right-32 w-[280px] md:w-[420px] h-[280px] md:h-[420px] rounded-full bg-[#74512D]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[280px] md:w-[420px] h-[280px] md:h-[420px] rounded-full bg-[#AF8F6F]/15 blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-sm px-4 md:px-6">
          {/* Error Message (BACKEND LOGIC) */}
          {errorMessage && (
            <div className="mb-6 px-4 md:px-5 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs md:text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              {errorMessage}
            </div>
          )}

          {/* Welcome Message (FRONTEND) */}
          <h1 className="text-xl md:text-2xl font-semibold text-[#2B1B12] mb-3">
            Welcome, {username}
          </h1>

          <p className="text-xs md:text-sm text-[#8A7F73] mb-8 leading-relaxed">
            Select a chat to start a private conversation.
          </p>

          {/* Encryption Badge (FRONTEND) */}
          <div
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2
                       rounded-full bg-white/70
                       border border-[#74512D]/10
                       shadow-sm text-xs text-[#74512D]"
          >
            🔒 End-to-end encrypted messaging
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-[#AF8F6F]/20">
        <div className="text-[#74512D]">Loading...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
