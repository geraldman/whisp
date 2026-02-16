"use client";

import { useParams, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import MessageInput from "@/app/components/messageinput";
import MessageBox from "../../layout/messageBox";
import ContactInfo from "@/app/components/ContactInfo";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/lib/context/AuthContext";
import { useChatContext } from "@/lib/context/ChatContext";
import { CHAT_INACTIVITY_TIMEOUT } from "@/lib/config/chatConfig";

export default function ChatDetailPage() {
    const params = useParams();
    const pathname = usePathname();
    const chatId = params?.chatid as string;
    const { uid } = useAuth();
    const { getChatMetadata } = useChatContext();
    const [chatExpired, setChatExpired] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [showProfile, setShowProfile] = useState(false);

    // Get chat metadata from context
    const chatMetadata = getChatMetadata(chatId);
    const otherUsername = chatMetadata?.username || "Loading...";
    const otherUserInitial = chatMetadata?.userInitial || "?";

    // Real-time countdown monitoring (BACKEND LOGIC)
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
                setTimeRemaining(Math.ceil(remaining / 1000));
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
                    updateCountdown();
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

    // Auto close profile on navigation (FRONTEND FEATURE)
    useEffect(() => {
        setShowProfile(false);
    }, [pathname]);

    // Format countdown as MM:SS
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative flex flex-col h-full bg-[#EFE6D8]">
            {/* ================= CHAT HEADER (FRONTEND STYLING) ================= */}
            <div
                className="h-14 px-6 flex items-center justify-between
                           bg-[#E6D5BC]
                           border border-[#74512D]/15"
            >
                {/* User Info */}
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
                        {otherUserInitial}
                    </div>

                    <div className="leading-tight">
                        <p className="text-sm font-medium text-[#2B1B12]">
                            {otherUsername}
                        </p>
                        <p className="text-[11px] text-black/50">
                            End-to-end encrypted
                        </p>
                    </div>
                </div>

                {/* Countdown Timer (BACKEND FEATURE) */}
                {timeRemaining !== null && (
                    <div
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg
                            text-sm font-semibold
                            ${timeRemaining <= 60
                                ? 'bg-red-50 border border-red-200 text-red-600'
                                : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                            }
                        `}
                    >
                        <span className="text-base">⏱️</span>
                        <span>{formatCountdown(timeRemaining)}</span>
                    </div>
                )}
            </div>

            {/* ================= MESSAGES (BACKEND COMPONENT) ================= */}
            <div className="flex-1 overflow-y-auto px-6 py-6 chat-scroll">
                <MessageBox />
            </div>

            {/* ================= INPUT (BACKEND COMPONENT - only if not expired) ================= */}
            {!chatExpired && (
                <div className="px-6 py-4 bg-[#E6D5BC] border-t border-[#74512D]/15">
                    <MessageInput />
                </div>
            )}

            {/* ================= CONTACT INFO SHEET (FRONTEND FEATURE) ================= */}
            <AnimatePresence>
                {showProfile && (
                    <ContactInfo onClose={() => setShowProfile(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

