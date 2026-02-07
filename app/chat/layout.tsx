"use client";

import Link from "next/link";
import { routes } from "@/app/routes";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
<<<<<<< Updated upstream
import ChatSidebar from "./components/ChatSidebar";
=======
import LoadingScreen from "@/app/components/LoadingScreen";
>>>>>>> Stashed changes

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

<<<<<<< Updated upstream
  if (loading) return null;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT: Sidebar persistent */}
      <ChatSidebar user={user} />
=======
  // Show loading screen while checking auth - prevents UI flash
  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar - Chat List (persists across navigation) */}
      <div className="w-[300px] border-r border-gray-300 p-5 overflow-y-auto flex flex-col">
        <h2>Chats</h2>
        <p>User: {user?.email}</p>
        {/* Add your chat list here */}
        <div>
          <p>Chat 1</p>
          <p>Chat 2</p>
          <p>Chat 3</p>
        </div>
        <div className="mt-auto">
          <Link href="/logout">
            <button>Logout</button>
          </Link>
        </div>
      </div>
>>>>>>> Stashed changes

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
