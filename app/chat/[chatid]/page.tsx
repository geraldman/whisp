//testing code

"use client";

import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import MessageBox from "../../layout/messageBox";
import MessageInput from "../../components/messageinput";

export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.chatid as string;
  const { user } = useRequireAuth();

  // ============================
  // MARK MESSAGE AS READ
  // ============================
  useEffect(() => {
    if (!user?.uid || !chatId) return;

    async function markAsRead() {
      const q = query(
        collection(db, "chats", chatId, "messages"),
        where("readBy", "not-in", [[user.uid]])
      );

      const snap = await getDocs(q);

      snap.docs.forEach(async (msg) => {
        await updateDoc(msg.ref, {
          readBy: arrayUnion(user.uid),
        });
      });
    }

    markAsRead();
  }, [chatId, user?.uid]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* HEADER */}
      <div
        style={{
          padding: 15,
          borderBottom: "1px solid #ccc",
          fontWeight: "bold",
        }}
      >
        Chat
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <MessageBox chatId={chatId} />
      </div>

      {/* INPUT */}
      <div style={{ padding: 15, borderTop: "1px solid #ccc" }}>
        <MessageInput chatId={chatId} />
      </div>
    </div>
  );
}
