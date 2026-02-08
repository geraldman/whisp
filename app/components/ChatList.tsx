"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

type ChatItem = {
  id: string;
  participants: string[];
  lastMessage?: string;
};

export default function ChatList({ user }: { user: any }) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const router = useRouter();

  // ===============================
  // LOAD CHATS
  // ===============================
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      where("isFriendChat", "==", true)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setChats(list);

      // resolve usernames
      list.forEach((chat) => {
        const otherUid = chat.participants.find(
          (u) => u !== user.uid
        );
        if (otherUid && !usernames[otherUid]) {
          fetchUsername(otherUid);
        }

        listenUnread(chat.id);
      });
    });

    return () => unsub();
  }, [user?.uid]);

  // ===============================
  // FETCH USERNAME
  // ===============================
  async function fetchUsername(uid: string) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setUsernames((p) => ({
        ...p,
        [uid]: snap.data().username,
      }));
    }
  }

  // ===============================
  // UNREAD COUNT
  // ===============================
  function listenUnread(chatId: string) {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      where("readBy", "not-in", [[user.uid]])
    );

    return onSnapshot(q, (snap) => {
      setUnread((p) => ({
        ...p,
        [chatId]: snap.size,
      }));
    });
  }

  // ===============================
  // RENDER
  // ===============================
  if (chats.length === 0) {
    return (
      <p style={{ padding: 16, color: "#888" }}>
        No chats yet
      </p>
    );
  }

  return (
    <div>
      {chats.map((chat) => {
        const otherUid = chat.participants.find(
          (u) => u !== user.uid
        );
        const name = usernames[otherUid!] || "Loading…";

        return (
          <div
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}`)}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>{name}</strong>
              <div style={{ fontSize: 12, color: "#666" }}>
                {chat.lastMessage || "No messages yet"}
              </div>
            </div>

            {unread[chat.id] > 0 && (
              <span
                style={{
                  background: "red",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: 12,
                }}
              >
                {unread[chat.id]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
