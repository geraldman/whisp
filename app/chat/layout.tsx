"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { routes } from "@/app/routes";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import ChatSidebar from "@/app/components/ChatSidebar";
import { addFriendAndCreateChat } from "@/app/actions/friend/addFriendAndCreateChat";
import { useRouter, usePathname } from "next/navigation";
import LoadingScreen from "@/app/components/LoadingScreen";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 🔴 STATE GLOBAL SEARCH RESULT
  const [searchResult, setSearchResult] = useState<any>(null);

  // Clear search result when navigating to a chat
  useEffect(() => {
    if (pathname && pathname.startsWith('/chat/') && pathname !== '/chat') {
      setSearchResult(null);
    }
  }, [pathname]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT */}
      <ChatSidebar
        user={user}
        onSearchResult={setSearchResult}
      />

      {/* RIGHT */}
      <main style={{ flex: 1, padding: 20 }}>
        {/* Kalau ada hasil search → override children */}
        {searchResult ? (
          <SearchResultView 
            result={searchResult} 
            onNavigateToChat={() => setSearchResult(null)} 
          />
        ) : (
          children
        )}
      </main>
    </div>
  );
}

/* =========================
   RESULT VIEW (KANAN)
   ========================= */
function SearchResultView({ result, onNavigateToChat }: { result: any; onNavigateToChat: () => void }) {
  const router = useRouter();
  const { user } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleAddFriend() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await addFriendAndCreateChat(
        user.uid,
        result.uid
      );

      if (res.alreadyFriends && res.chatId) {
        // Already friends, navigate to existing chat
        onNavigateToChat();
        router.push(`/chat/${res.chatId}`);
      } else if (res.requestSent) {
        // Friend request sent successfully
        setSuccess("Friend request sent! Wait for them to accept.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to send friend request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ border: "1px solid #ccc", padding: 24, width: 400 }}>
        <p><strong>Username:</strong> {result.username}</p>
        <p><strong>Numeric ID:</strong> {result.numericId}</p>

        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: 12 }}>{success}</p>}

        <button
          onClick={handleAddFriend}
          disabled={loading || !!success}
          style={{ marginTop: 12, width: "100%" }}
        >
          {loading ? "Sending request..." : success ? "Request Sent ✓" : "Add Friend / Start Chat"}
        </button>
      </div>
    </div>
  );
}
