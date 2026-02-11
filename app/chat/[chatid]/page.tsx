"use client";

import { useParams, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import MessageComponent from "@/app/components/messageComponent";
import MessageInput from "@/app/components/messageinput";

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

      {/* ================= FRIEND PROFILE SHEET ================= */}
      {showProfile && (
        <div className="absolute inset-0 z-50 flex">
          {/* OVERLAY */}
          <div
            className="flex-1 bg-black/20"
            onClick={() => setShowProfile(false)}
          />

          {/* SIDE SHEET */}
          <div className="w-[360px] h-full bg-[#F6F1E3]
                          shadow-[ -8px_0_24px_rgba(0,0,0,0.15)]
                          flex flex-col">
            {/* HEADER */}
            <div className="px-5 h-14 flex items-center justify-between
                            border-b border-[#74512D]/15">
              <p className="text-sm font-semibold text-[#543310]">
                Contact Info
              </p>

              <button
                onClick={() => setShowProfile(false)}
                aria-label="Close profile"
                className="cursor-pointer w-8 h-8 flex items-center justify-center
                          rounded-full text-[#74512D]
                          hover:bg-[#E6D5BC]
                          transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div
                className="w-24 h-24 rounded-full bg-white
                           border border-[#74512D]/25
                           flex items-center justify-center mb-4"
              >
                <span className="text-3xl font-semibold text-[#543310]">
                  A
                </span>
              </div>

              <p className="text-lg font-semibold text-[#543310]">
                Aliceeee_
              </p>

              <p className="text-sm text-[#74512D] mt-1">
                ID · 567832
              </p>

              <button
                className="cursor-pointer mt-6 px-6 py-2.5 rounded-xl
                           bg-white border border-[#74512D]/30
                           text-[#543310] text-sm font-medium
                           shadow-[0_6px_18px_rgba(84,51,16,0.18)]
                           hover:bg-[#F1E3CD]
                           active:scale-95
                           transition"
              >
                View profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
