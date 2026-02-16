"use client";

import { useParams } from "next/navigation";
import MessageInput from "@/app/components/messageinput";
import MessageBox from "../../layout/messageBox";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/lib/context/AuthContext";
import { CHAT_INACTIVITY_TIMEOUT } from "@/lib/config/chatConfig";

export default function ChatDetailPage() {
    const params = useParams();
    const chatId = params.chatid as string;
    const { uid } = useAuth();
    const [chatExpired, setChatExpired] = useState(false);

    // Check if chat has expired to hide input container
    useEffect(() => {
        if (!chatId || !uid || chatId.startsWith("friend_")) return;

        let mounted = true;

        async function checkChatExpiry() {
            try {
                const chatDocRef = doc(db, "chats", chatId);
                const chatSnapshot = await getDoc(chatDocRef);

                if (!mounted) return;

                if (!chatSnapshot.exists()) {
                    setChatExpired(true);
                    return;
                }

                const chatData = chatSnapshot.data();
                const lastActivity = chatData.lastActivity;

                if (lastActivity) {
                    const lastActivityTime = lastActivity.toMillis();
                    const now = Date.now();
                    const timeSinceActivity = now - lastActivityTime;

                    if (timeSinceActivity > CHAT_INACTIVITY_TIMEOUT) {
                        setChatExpired(true);
                        return;
                    }
                }

                setChatExpired(false);
            } catch (error) {
                if (!mounted) return;
                console.error("Failed to check chat expiry:", error);
            }
        }

        checkChatExpiry();

        return () => {
            mounted = false;
        };
    }, [chatId, uid]);

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

            {/* Message Input - only show container if chat not expired */}
            {!chatExpired && (
                <div style={{ padding: "15px", borderTop: "1px solid #ccc" }}>
                    <MessageInput />
                </div>
            )}
        </div>
    );
} 