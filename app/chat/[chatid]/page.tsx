"use client";

import { useParams, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import MessageComponent from "@/app/components/messageComponent";
import MessageInput from "@/app/components/messageinput";
import ContactInfo from "@/app/components/ContactInfo";

export default function ChatDetailPage() {
  const { chatid } = useParams<{ chatid: string }>();
  const pathname = usePathname();

  const [messages, setMessages] = useState([
    { messageText: "Halo", from: "receive" as const },
    { messageText: "Iya?", from: "send" as const },
  ]);

  const [showProfile, setShowProfile] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  function handleSend(text: string) {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { messageText: text, from: "send" },
    ]);
  }

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= AUTO CLOSE PROFILE ================= */
  useEffect(() => {
    setShowProfile(false);
  }, [pathname]);

  return (
    <div className="relative flex flex-col h-full bg-[#EFE6D8]">
      {/* ================= CHAT HEADER ================= */}
      <div
        className="h-14 px-6 flex items-center
                   bg-[#E6D5BC]
                   border border-[#74512D]/15"
      >
        <div
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 cursor-pointer
                     hover:opacity-80 transition"
        >
          <div
            className="w-8 h-8 rounded-full bg-white border border-black/10
                       flex items-center justify-center
                       text-xs font-medium text-[#2B1B12]"
          >
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
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 chat-scroll">
        {messages.map((msg, idx) => (
          <MessageComponent
            key={idx}
            messageText={msg.messageText}
            from={msg.from}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT ================= */}
      <MessageInput onSend={handleSend} />

      {/* ================= CONTACT INFO SHEET ================= */}
      {showProfile && (
        <ContactInfo onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
