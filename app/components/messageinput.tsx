"use client";

import { useState } from "react";

export default function MessageInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [message, setMessage] = useState("");

  function handleSend() {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage("");
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-end gap-3">

        {/* TEXTAREA */}
        <textarea
          className="
            flex-1 resize-none rounded-full px-4 py-2.5 text-sm
            bg-white text-[#2B1B12]
            outline-none
            border border-black/5
            focus:border-[#AF8F6F]/40
            shadow-sm
          "
          placeholder="Write your message…"
          value={message}
          rows={1}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all
            ${
              message.trim()
                ? "bg-[#7A573A] hover:bg-[#6A4B33] shadow-md shadow-black/10"
                : "bg-[#CFC5BA] cursor-not-allowed"
            }
          `}
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M22 2L11 13"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M22 2L15 22l-4-9-9-4 20-7z"
            />
          </svg>
        </button>

      </div>
    </div>
  );
}
