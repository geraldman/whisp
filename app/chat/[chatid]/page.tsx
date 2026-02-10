"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import MessageComponent from "@/app/components/messageComponent";
import MessageInput from "@/app/components/messageInput";

export default function ChatDetailPage() {
  const { chatid } = useParams<{ chatid: string }>();

  const [messages, setMessages] = useState([
    { messageText: "Halo", from: "receive" as const },
    { messageText: "Iya?", from: "send" as const },
  ]);

  function handleSend(text: string) {
    setMessages((prev) => [
      ...prev,
      { messageText: text, from: "send" },
    ]);
  }

  return (
    <div className="flex flex-col h-full bg-[#F6F1E3]">

      {/* CHAT HEADER */}
      <div className="h-14 px-6 flex items-center border-b border-black/5">
        <span className="font-medium text-[#2B1B12]">
          Alice in Wonderland
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg, idx) => (
          <MessageComponent
            key={idx}
            messageText={msg.messageText}
            from={msg.from}
          />
        ))}
      </div>

      {/* INPUT */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}
