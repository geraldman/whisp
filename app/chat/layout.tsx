"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import ChatSidebar from "./components/ChatSidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

  if (loading) return null;

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
