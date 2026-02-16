"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, rtdb } from "@/lib/firebase/firebase";
import { ref, onValue } from "firebase/database";

interface Chat {
  id: string; // chatId or friend_${friendRequestId}
  participants: string[];
  otherParticipantId: string;
  isFriendChat: boolean;
  createdAt: number | null;
  saved: boolean;
  chatExists: boolean; // Whether chat document exists or just friend relationship
  friendRequestId?: string; // Friend request ID when chat doesn't exist
}

interface FriendRequest {
  id: string;
  from: string;
  to: string;
  chatId: string;
  status: string;
  acceptedAt?: any;
}

interface PresenceStatus {
  online: boolean;
  lastSeen?: any;
}

interface ChatListProps {
  uid: string;
}

export default function ChatList({ uid }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [presenceStatus, setPresenceStatus] = useState<Record<string, PresenceStatus>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const currentChatId = params.chatid as string;

  // Use refs to store stable data references across listener updates
  const activeChatsRef = useRef<Chat[]>([]);
  const friendRelationshipsRef = useRef<Map<string, FriendRequest>>(new Map());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function to prevent multiple rapid re-renders
  const scheduleUpdate = useCallback(async () => {
    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Schedule a new update after a short delay
    updateTimeoutRef.current = setTimeout(async () => {
      const chatMap = new Map<string, Chat>();

      // Add all active chats
      activeChatsRef.current.forEach((chat) => {
        chatMap.set(chat.id, chat);
      });

      // Add friends whose chats don't exist (expired/cleaned up)
      friendRelationshipsRef.current.forEach((friendReq) => {
        // Validate friend request has required fields (chatId is optional now)
        if (!friendReq.from || !friendReq.to) return;
        
        const chatId = friendReq.chatId || `friend_${friendReq.id}`; // Use friend request ID as fallback
        
        // If chat doesn't exist in active chats, add it as inactive
        if (!chatMap.has(chatId)) {
          const otherParticipantId = friendReq.from === uid ? friendReq.to : friendReq.from;
          
          chatMap.set(chatId, {
            id: chatId,
            participants: [friendReq.from, friendReq.to],
            otherParticipantId,
            isFriendChat: true,
            createdAt: friendReq.acceptedAt ? friendReq.acceptedAt.toMillis() : null,
            saved: false,
            chatExists: false, // Chat expired or never created, will be created on click
            friendRequestId: friendReq.id, // Store friend request ID for reference
          });
        }
      });

      const chatList = Array.from(chatMap.values()).sort((a, b) => {
        // Sort by createdAt descending (newest first)
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      setChats(chatList);

      // Fetch usernames for all other participants
      const userIds = chatList.map((chat) => chat.otherParticipantId).filter(Boolean);
      const uniqueUserIds = [...new Set(userIds)];

      const usernameMap: Record<string, string> = {};
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            usernameMap[userId] = userDoc.data().username || "Unknown";
          }
        })
      );

      setUsernames(usernameMap);
      setLoading(false);
    }, 100); // 100ms debounce
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Listen to both active chats AND accepted friend requests
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid),
      orderBy("createdAt", "desc")
    );

    // Two separate queries for friend requests to satisfy security rules
    const friendRequestsFromQuery = query(
      collection(db, "friend_requests"),
      where("from", "==", uid),
      where("status", "==", "accepted")
    );

    const friendRequestsToQuery = query(
      collection(db, "friend_requests"),
      where("to", "==", uid),
      where("status", "==", "accepted")
    );

    // Listen to active chats
    const chatsUnsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        if (!mounted) return;
        activeChatsRef.current = snapshot.docs.map((doc) => {
          const data = doc.data();
          const otherParticipantId = data.participants.find((p: string) => p !== uid);

          return {
            id: doc.id,
            participants: data.participants,
            otherParticipantId,
            isFriendChat: data.isFriendChat ?? false,
            createdAt: data.createdAt ? data.createdAt.toMillis() : null,
            saved: data.saved ?? false,
            chatExists: true,
          };
        });

        // Schedule debounced update
        scheduleUpdate();
      },
      (error) => {
        if (!mounted) return;
        console.error("Failed to listen to chats:", error);
        setLoading(false);
      }
    );

    // Listen to friend requests where current user is the sender
    const friendsFromUnsubscribe = onSnapshot(
      friendRequestsFromQuery,
      (snapshot) => {
        if (!mounted) return;
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as FriendRequest;
          friendRelationshipsRef.current.set(doc.id, { ...data, id: doc.id });
        });

        // Schedule debounced update
        scheduleUpdate();
      },
      (error) => {
        if (!mounted) return;
        console.error("Failed to listen to friend requests (from):", error);
      }
    );

    // Listen to friend requests where current user is the receiver
    const friendsToUnsubscribe = onSnapshot(
      friendRequestsToQuery,
      (snapshot) => {
        if (!mounted) return;
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as FriendRequest;
          friendRelationshipsRef.current.set(doc.id, { ...data, id: doc.id });
        });

        // Schedule debounced update
        scheduleUpdate();
      },
      (error) => {
        if (!mounted) return;
        console.error("Failed to listen to friend requests (to):", error);
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      chatsUnsubscribe();
      friendsFromUnsubscribe();
      friendsToUnsubscribe();
    };
  }, [uid, scheduleUpdate]);

  // Listen to presence status for all users in chats (Realtime Database)
  useEffect(() => {
    if (chats.length === 0) return;

    let mounted = true;
    const userIds = chats.map((chat) => chat.otherParticipantId).filter(Boolean);
    const uniqueUserIds = [...new Set(userIds)];

    const unsubscribers = uniqueUserIds.map((userId) => {
      const presenceRef = ref(rtdb, `presence/${userId}`);
      
      return onValue(
        presenceRef,
        (snapshot) => {
          if (!mounted) return;
          if (snapshot.exists()) {
            setPresenceStatus((prev) => ({
              ...prev,
              [userId]: snapshot.val() as PresenceStatus,
            }));
          } else {
            // User has no presence document, consider offline
            setPresenceStatus((prev) => ({
              ...prev,
              [userId]: { online: false },
            }));
          }
        },
        (error) => {
          if (!mounted) return;
          console.error(`Failed to listen to presence for ${userId}:`, error);
        }
      );
    });

    return () => {
      mounted = false;
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [chats]);

  if (loading) {
    return (
      <div style={{ 
        flex: 1, 
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ fontSize: 14, color: "#999" }}>
          Loading chats...
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div style={{ 
        flex: 1, 
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}>
        <div style={{ fontSize: 14, color: "#999", textAlign: "center" }}>
          No chats yet. Search for a user to start chatting!
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #e0e0e0" }}>
      <div style={{ 
        padding: "12px 16px", 
        fontWeight: "bold", 
        fontSize: 14,
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #e0e0e0"
      }}>
        Chats
      </div>
      {chats.map((chat) => {
        const otherUsername = usernames[chat.otherParticipantId] || "Loading...";
        const isActive = currentChatId === chat.id;
        const presence = presenceStatus[chat.otherParticipantId];
        const isOnline = presence?.online || false;

        return (
          <div
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}`)}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: isActive ? "#e3f2fd" : "transparent",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between" 
            }}>
              <div style={{ 
                display: "flex", 
                flexDirection: "column",
                gap: 2
              }}>
                <div style={{ fontWeight: isActive ? "bold" : "normal", fontSize: 14 }}>
                  {otherUsername}
                </div>
                {!chat.chatExists && (
                  <div style={{ 
                    fontSize: 10, 
                    color: "#ff9800",
                    fontStyle: "italic"
                  }}>
                    Chat expired - click to restore
                  </div>
                )}
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 4 
              }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: isOnline ? "#4caf50" : "#9e9e9e",
                  }}
                />
                <span style={{ 
                  fontSize: 11, 
                  color: isOnline ? "#4caf50" : "#9e9e9e" 
                }}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
