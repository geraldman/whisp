"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { getIncomingFriendRequests } from "@/app/actions/friend/getIncomingFriendRequests";
import { acceptFriendRequest } from "@/app/actions/friend/acceptFriendRequest";
import { useRouter } from "next/navigation";

export default function SettingsMenu() {
  const { user } = useRequireAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const router = useRouter();

useEffect(() => {
  if (!user?.uid) return;

  const userId = user.uid; // Capture uid to avoid null issues

  async function load() {
    const data = await getIncomingFriendRequests(userId);

    // 🔒 HANYA REQUEST YANG PUNYA USERNAME
    const validRequests = data.filter(
      (r: any) => typeof r.fromUsername === "string" && r.fromUsername.trim() !== ""
    );

    setRequests(validRequests);
  }

  load();
}, [user?.uid]);


  async function handleAccept(reqId: string, chatId: string) {
    await acceptFriendRequest(reqId);
    router.push(`/chat/${chatId}`);
  }

  return (
    <div
      style={{
        marginTop: 10,
        border: "1px solid #ddd",
        padding: 10,
        borderRadius: 6,
        background: "#fff",
      }}
    >
            <p style={{ cursor: "pointer" }}>Profile</p>
      <p style={{ cursor: "pointer" }}>Settings</p>
      <p><strong>Friend Requests</strong></p>

      {requests.length === 0 && (
        <p style={{ fontSize: 12, color: "#999" }}>No requests</p>
      )}

      {requests.map((r) => (
        <div key={r.id} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13 }}>
            From: <strong>{r.fromUsername}</strong>
          </div>
          <button
            style={{ marginTop: 4 }}
            onClick={() => handleAccept(r.id, r.chatId)}
          >
            Accept
          </button>
        </div>
      ))}

      <hr />

      <p
        style={{ cursor: "pointer", color: "red" }}
        onClick={() => signOut(auth)}
      >
        Logout
      </p>
    </div>
  );
}

