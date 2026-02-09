"use client";

import { useState } from "react";

interface MessageInputProps {
    onSendMessage: (message: string) => Promise<void>;
    disabled?: boolean;
}

function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!message.trim() || sending || disabled) return;
        
        setSending(true);
        try {
            await onSendMessage(message.trim());
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sending || disabled}
                />
                <button
                    type="submit"
                    disabled={sending || disabled || !message.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                🔒 End-to-end encrypted • Messages auto-delete when both users log out
            </p>
        </form>
    );
}

export default MessageInput;
