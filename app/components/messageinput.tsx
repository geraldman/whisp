//test code
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export default function MessageInput() {
  const { user } = useRequireAuth();
  const params = useParams();
  const chatId = params.chatid as string;

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!text.trim() || !user?.uid) return;

    setLoading(true);

    try {
      // 🔐 NANTI: encryptText(text)
      const encryptedText = text; // sementara plaintext

      // 1️⃣ Tulis message
      await addDoc(
        collection(db, "chats", chatId, "messages"),
        {
          senderId: user.uid,
          encryptedText,
          createdAt: serverTimestamp(),
          readBy: [user.uid],
        }
      );

      // 2️⃣ Update lastMessage di chat
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: encryptedText,
        lastMessageAt: serverTimestamp(),
      });

      setText("");
    } catch (e) {
      console.error("Send message error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        style={{ flex: 1, padding: 10 }}
      />
      <button onClick={sendMessage} disabled={loading}>
        Send
      </button>
    </div>
  );
}


//kode gerald
/*"use client";

import { useState } from "react";

function messageInput(){
    const [message, setMessage] = useState("");

    return (
        <div className="flex flex-row w-full pb-5 px-10">
            <textarea 
                name="" 
                id="" 
                className="w-9/10" 
                placeholder="Write your message here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button 
                className="flex w-1/10 items-center justify-center"
                disabled={!message.trim()}
            >
                <span className={`flex items-center justify-center rounded-full p-3 ${message.trim() ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    <img src="/sent-02-stroke-rounded.png" alt="Send" className="invert" />
                </span>
            </button>
        </div>
    ) 
}

export default messageInput;*/
