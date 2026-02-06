"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar - Chat List (persists across navigation) */}
      <aside style={{ 
        width: "300px", 
        borderRight: "1px solid #ccc",
        padding: "20px",
        overflowY: "auto"
      }}>
        <h2>Chats</h2>
        <p>User: {user?.email}</p>
        {/* Add your chat list here */}
        <div>
          <p>Chat 1</p>
          <p>Chat 2</p>
          <p>Chat 3</p>
        </div>
      </aside>

      {/* Right Content Area - Changes with URL */}
      <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
