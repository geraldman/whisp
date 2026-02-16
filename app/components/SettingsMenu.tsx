"use client";

import { auth, db } from "@/lib/firebase/firebase";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { acceptFriendRequest } from "@/app/actions/friend/acceptFriendRequest";
import { logout } from "@/app/actions/logout";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function SettingsMenu({ onRequestHandled }: { onRequestHandled?: () => void }) {
  const { user } = useRequireAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const router = useRouter();

useEffect(() => {
  if (!user?.uid) return;

  // Real-time listener for friend requests
  const requestsQuery = query(
    collection(db, "friend_requests"),
    where("to", "==", user.uid),
    where("status", "==", "pending")
  );

  const unsubscribe = onSnapshot(
    requestsQuery,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const reqData = doc.data();
        return {
          id: doc.id,
          from: reqData.from,
          fromUsername: reqData.fromUsername ?? null,
          to: reqData.to,
          status: reqData.status,
          chatId: reqData.chatId,
          createdAt: reqData.createdAt ? reqData.createdAt.toMillis() : null,
        };
      });

      // 🔒 HANYA REQUEST YANG PUNYA USERNAME
      const validRequests = data.filter(
        (r: any) => typeof r.fromUsername === "string" && r.fromUsername.trim() !== ""
      );

      setRequests(validRequests);
    },
    (error) => {
      console.error("Failed to listen to friend requests:", error);
    }
  );

  return () => unsubscribe();
}, [user?.uid]);


  async function handleAccept(reqId: string) {
    const result = await acceptFriendRequest(reqId);
    
    // No need to manually refresh - real-time listener will update automatically
    
    // Notify parent (though not strictly needed with real-time listeners)
    if (onRequestHandled) {
      onRequestHandled();
    }
    
    // Navigate to the newly created chat
    if (result.chatId) {
      router.push(`/chat/${result.chatId}`);
    }
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
            onClick={() => handleAccept(r.id)}
          >
            Accept
          </button>
        </div>
      ))}

      <hr />

      <p
        style={{ cursor: "pointer", color: "red" }}
        onClick={() => logout()}
      >
        Logout
      </p>
    </div>
  );
}
