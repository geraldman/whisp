"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import ChatSidebar from "../components/ChatSidebar";
import FriendRequestsView from "../chat/views/FriendRequestsView";
import ChatDetailPage from "./[chatid]/page";

type RightView = "idle" | "friendRequests" | "ChatDetailPage";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();
  const [view, setView] = useState<RightView>("idle");

  if (loading) return null;

  function toggleFriendRequests() {
    setView((v) => (v === "friendRequests" ? "idle" : "friendRequests"));
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT */}
      <ChatSidebar
        user={user}
        onOpenFriendRequests={toggleFriendRequests}
      />

      {/* RIGHT */}
      <main style={{ flex: 1, padding: 20 }}>
        {view === "friendRequests" ? (
          <FriendRequestsView />
        ) : view === "ChatDetailPage" ? (
          <ChatDetailPage />
        ) : (
          children
        )}
      </main>
    </div>
  );
}
