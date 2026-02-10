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
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { messageText: text, from: "send" },
    ]);
  }

  return (
    <div className="flex flex-col h-full bg-[#EFE6D8]">

      {/* ================= CHAT HEADER ================= */}
      <div
        className="h-14 px-6 flex items-center
                   bg-[#E6D5BC]
                   border-b border-black/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-black/10
                          flex items-center justify-center text-xs font-medium text-[#2B1B12]">
            A
          </div>

          <div className="leading-tight">
            <p className="text-sm font-medium text-[#2B1B12]">
              Aliceeee_
            </p>
            <p className="text-[11px] text-black/50">
              ID · 567832
            </p>
          </div>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
        {messages.map((msg, idx) => (
          <MessageComponent
            key={idx}
            messageText={msg.messageText}
            from={msg.from}
          />
        ))}
      </div>

      {/* ================= INPUT ================= */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}
