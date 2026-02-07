"use client";

import Link from "next/link";
import { routes } from "@/app/routes";
import Link from "next/link";
import { routes } from "@/app/routes";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import ChatSidebar from "@/app/components/ChatSidebar";
import LoadingScreen from "@/app/components/LoadingScreen";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT: Sidebar persistent */}
      <ChatSidebar user={user} />

      {/* RIGHT: Route-based content */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#fafafa",
        }}
      >
        {children}
      </main>
    </div>
  );
}
