"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import ChatSidebar from "../components/ChatSidebar";
import { addFriendAndCreateChat } from "@/app/actions/addFriendAndCreateChat";
import { useRouter } from "next/navigation";


export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

  // 🔴 STATE GLOBAL SEARCH RESULT
  const [searchResult, setSearchResult] = useState<any>(null);

  if (loading) return null;

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
          <SearchResultView result={searchResult} />
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
function SearchResultView({ result }: any) {
  const router = useRouter();
  const { user } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAddFriend() {
    try {
      setLoading(true);
      setError("");

      const res = await addFriendAndCreateChat(
        user.uid,
        result.uid
      );

      router.push(`/chat/${res.chatId}`);
    } catch (err: any) {
      setError("Failed to start chat");
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

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          onClick={handleAddFriend}
          disabled={loading}
          style={{ marginTop: 12, width: "100%" }}
        >
          {loading ? "Starting chat..." : "Add Friend / Start Chat"}
        </button>
      </div>
    </div>
  );
}
