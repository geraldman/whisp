"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { getIncomingFriendRequests } from "@/app/actions/friend/getIncomingFriendRequests";
import { acceptFriendRequest } from "@/app/actions/friend/acceptFriendRequest";
import { addFriendAndCreateChat } from "@/app/actions/friend/addFriendAndCreateChat";
import { useRouter } from "next/navigation";
import SearchUser from "@/app/components/SearchUser";

type Mode = "list" | "search";

export default function FriendRequestsView() {
  const { user } = useRequireAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("list");
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.uid) return;

    async function load() {
      const data = await getIncomingFriendRequests(user.uid);
      setRequests(
        data.filter((r: any) => r.fromUsername?.trim())
      );
    }

    load();
  }, [user?.uid]);

  async function handleAccept(reqId: string, chatId: string) {
    await acceptFriendRequest(reqId);
    router.push(`/chat/${chatId}`);
  }

  function handleSearchResult(result: any | null) {
    // 🔁 SEARCH DIBATALKAN / INPUT KOSONG
    if (!result) {
      setSearchResult(null);
      setMode("list");
      setError("");
      return;
    }

    // 🔍 SEARCH BERHASIL
    setSearchResult(result);
    setMode("search");
  }

  async function handleAddFriend() {
    if (!user || !searchResult) return;

    try {
      const res = await addFriendAndCreateChat(
        user.uid,
        searchResult.uid
      );
      router.push(`/chat/${res.chatId}`);
    } catch (e: any) {
      setError(e.message || "Failed to start chat");
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      {/* 🔍 SEARCH SELALU ADA */}
      <SearchUser onSearchResult={handleSearchResult} />

      <hr style={{ margin: "20px 0" }} />

      {/* ================= LIST MODE ================= */}
      {mode === "list" && (
        <>
          <h3>Friend Requests</h3>

          {requests.length === 0 && (
            <p style={{ color: "#888" }}>No requests</p>
          )}

          {requests.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                marginTop: 10,
              }}
            >
              <div>
                From: <strong>{r.fromUsername}</strong>
              </div>

              <button
                style={{ marginTop: 8 }}
                onClick={() => handleAccept(r.id, r.chatId)}
              >
                Accept
              </button>
            </div>
          ))}
        </>
      )}

      {/* ================= SEARCH MODE ================= */}
      {mode === "search" && searchResult && (
        <>
          <h3>Search Result</h3>

          <div
            style={{
              border: "1px solid #ccc",
              padding: 16,
              marginTop: 12,
            }}
          >
            <div>
              Username: <strong>{searchResult.username}</strong>
            </div>
            <div>Numeric ID: {searchResult.numericId}</div>

            {error && (
              <p style={{ color: "red", marginTop: 8 }}>{error}</p>
            )}

            <button
              style={{ marginTop: 10 }}
              onClick={handleAddFriend}
            >
              Add Friend / Start Chat
            </button>
          </div>
        </>
      )}
    </div>
  );
}
