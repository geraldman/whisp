"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import LoadingScreen from "@/app/components/LoadingScreenFixed";
import ChatList from "@/app/components/ChatList";

/* ===================================================== */

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { user, loading } = useRequireAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  /* ================= MOBILE DETECTOR ================= */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  /* ================= ERROR HANDLER ================= */
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    if (error === "notfound") {
      setErrorMessage(
        "Chat not found. The chat may have been deleted due to inactivity."
      );
    } else if (error === "expired") {
      setErrorMessage(
        "This chat expired due to inactivity. Select it again to recreate with new encryption keys."
      );
    }

    const timeout = setTimeout(() => {
      setErrorMessage(null);
    }, 6000);

    return () => clearTimeout(timeout);
  }, [searchParams]);

  /* ================= LOADING ================= */
  if (loading || !user) {
    return <LoadingScreen />;
  }

  const username =
    user.displayName || user.email?.split("@")[0] || "User";

  /* ================= RENDER ================= */
  return (
    <div className="w-full min-h-[100svh] flex flex-col bg-[#F6F1E3] pb-safe md:pb-0">
      <div className="flex-1 flex flex-col relative">

        {/* background blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[280px] md:w-[420px] h-[280px] md:h-[420px] rounded-full bg-[#74512D]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 w-[280px] md:w-[420px] h-[280px] md:h-[420px] rounded-full bg-[#AF8F6F]/15 blur-3xl" />

        {/* ================= MOBILE ================= */}
        {isMobile ? (
          <div className="flex-1 overflow-y-auto">

            {/* breathing space */}
            <div className="h-3" />

            {/* chat list */}
            <div className="px-3 pb-28">
              {user.uid && <ChatList uid={user.uid} />}
            </div>

          </div>
        ) : (
          /* ================= DESKTOP WELCOME ================= */
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="text-center max-w-sm px-4 md:px-6">

              {errorMessage && (
                <div className="mb-6 px-4 md:px-5 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs md:text-sm shadow-sm">
                  {errorMessage}
                </div>
              )}

              <h1 className="text-xl md:text-2xl font-semibold text-[#2B1B12] mb-3">
                Welcome, {username}
              </h1>

              <p className="text-xs md:text-sm text-[#8A7F73] mb-8 leading-relaxed">
                Select a chat from the sidebar.
              </p>

              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/70 border border-[#74512D]/10 shadow-sm text-xs text-[#74512D]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 11V7a4 4 0 118 0v4"
                  />
                </svg>
                <span>End-to-end encrypted messaging</span>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================================================== */

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center bg-[#AF8F6F]/20">
          <div className="text-[#74512D]">Loading...</div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}