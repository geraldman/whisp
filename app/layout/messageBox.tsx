//test code
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export default function MessageBox() {
  const { user } = useRequireAuth();
  const params = useParams();
  const chatId = params.chatid as string;

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!chatId || !user?.uid) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMessages(data);

      // 👁 mark as read
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.readBy?.includes(user.uid)) {
          updateDoc(docSnap.ref, {
            readBy: arrayUnion(user.uid),
          });
        }
      });
    });

    return () => unsub();
  }, [chatId, user?.uid]);

  if (!messages.length) {
    return <p>No messages yet</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {messages.map((m) => {
        const isMe = m.senderId === user?.uid;

        return (
          <div
            key={m.id}
            style={{
              alignSelf: isMe ? "flex-end" : "flex-start",
              background: isMe ? "#DCF8C6" : "#EEE",
              padding: 10,
              borderRadius: 10,
              maxWidth: "70%",
            }}
          >
            {/* 🔓 nanti decrypt */}
            {m.encryptedText}
          </div>
        );
      })}
    </div>
  );
}


//kode gerald
/*import MessageComponent from "../components/messageComponent";

function messageBox(){
    return (
        <div className="flex flex-col gap-2 px-10">
            <MessageComponent messageText="Hello" from="send"/>
            <MessageComponent messageText="Hello" from="receive"/>
            <MessageComponent messageText="How are you" from="send"/>
            <MessageComponent messageText="im fine, hbu?" from="receive"/>
            <MessageComponent messageText="very good" from="send"/>
            <MessageComponent messageText="im doing well" from="send"/>
        </div>
    )
}

export default messageBox;*/