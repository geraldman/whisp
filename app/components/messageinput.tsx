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
    <div className="px-6 py-4 bg-[#F6F1E3] border-t border-black/5">
      <div className="flex items-center gap-3">

        <textarea
          className="
            flex-1 resize-none rounded-full px-4 py-2 text-sm
            bg-white outline-none border border-black/5
          "
          placeholder="Write your message…"
          value={message}
          rows={1}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`
            rounded-full p-3 transition
            ${
              message.trim()
                ? "bg-[#7A573A] hover:bg-[#6A4B33] shadow-md shadow-black/10"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          <span className="text-white text-sm">→</span>
        </button>

      </div>
    </div>
  );
}
