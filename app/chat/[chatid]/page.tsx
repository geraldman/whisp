"use client";

import { useParams } from "next/navigation";
import MessageInput from "@/app/components/messageinput";
import MessageBox from "../../layout/messageBox";
import { useState, useEffect } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/lib/context/AuthContext";
import { CHAT_INACTIVITY_TIMEOUT } from "@/lib/config/chatConfig";

export default function ChatDetailPage() {
    const params = useParams();
    const chatId = params.chatid as string;
    const { uid } = useAuth();
    const [chatExpired, setChatExpired] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    // Real-time countdown monitoring
    useEffect(() => {
        if (!chatId || !uid || chatId.startsWith("friend_")) return;

        let mounted = true;
        let lastActivityTime: number | null = null;
        let checkInterval: NodeJS.Timeout | undefined;

        const chatDocRef = doc(db, "chats", chatId);

        // Function to update countdown and check expiry
        const updateCountdown = () => {
            if (!mounted || !lastActivityTime) return;

            const now = Date.now();
            const timeSinceActivity = now - lastActivityTime;
            const remaining = CHAT_INACTIVITY_TIMEOUT - timeSinceActivity;

            // If expired
            if (remaining <= 0) {
                setChatExpired(true);
                setTimeRemaining(null);
                return;
            }

            // Show countdown if less than 5 minutes remaining
            const fiveMinutes = 5 * 60 * 1000;
            if (remaining <= fiveMinutes) {
                setTimeRemaining(Math.ceil(remaining / 1000)); // Convert to seconds
            } else {
                setTimeRemaining(null);
            }
        };

        // Set up real-time listener
        const unsubscribe = onSnapshot(
            chatDocRef,
            (snapshot) => {
                if (!mounted) return;

                if (!snapshot.exists()) {
                    setChatExpired(true);
                    setTimeRemaining(null);
                    return;
                }

                const chatData = snapshot.data();
                if (chatData.lastActivity) {
                    lastActivityTime = chatData.lastActivity.toMillis();
                    updateCountdown(); // Update immediately when activity changes
                }
            },
            (error) => {
                if (!mounted) return;
                console.error("Failed to monitor chat:", error);
            }
        );

        // Update countdown every second
        checkInterval = setInterval(updateCountdown, 1000);

        return () => {
            mounted = false;
            unsubscribe();
            if (checkInterval) clearInterval(checkInterval);
        };
    }, [chatId, uid]);

    // Format countdown as MM:SS
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Chat Header */}
            <div style={{ 
                padding: "15px", 
                borderBottom: "1px solid #ccc",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}>
                <span>Chat ID: {chatId}</span>
                {timeRemaining !== null && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 12px",
                        backgroundColor: timeRemaining <= 60 ? "#fee" : "#fff3cd",
                        border: `1px solid ${timeRemaining <= 60 ? "#f5c6cb" : "#ffeaa7"}`,
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: timeRemaining <= 60 ? "#dc3545" : "#856404"
                    }}>
                        <span style={{ fontSize: "16px" }}>⏱️</span>
                        <span>{formatCountdown(timeRemaining)}</span>
                    </div>
                )}
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