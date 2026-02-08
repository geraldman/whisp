"use client";

import { useParams } from "next/navigation";
import MessageInput from "@/app/components/messageinput";
import MessageBox from "../../layout/messageBox";

export default function ChatDetailPage() {
    const params = useParams();
    const chatId = params.chatid as string;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Chat Header */}
            <div style={{ 
                padding: "15px", 
                borderBottom: "1px solid #ccc",
                fontWeight: "bold" 
            }}>
                Chat ID: {chatId}
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                <MessageBox />
            </div>

            {/* Message Input */}
            <div style={{ padding: "15px", borderTop: "1px solid #ccc" }}>
                <MessageInput />
            </div>
        </div>
    );
} 