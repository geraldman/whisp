"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/lib/context/AuthContext";
import { getDB } from "@/lib/db/indexeddb";
import { storeSessionKey } from "@/app/actions/getOrCreateSessionKey";
import { getUserPublicKeys } from "@/app/actions/getUserPublicKey";
import { initializeChatSession } from "@/app/actions/initializeChatSession";
import { ensureChatFromFriendRequest } from "@/app/actions/ensureChatFromFriendRequest";
import { unlinkChatFromFriendRequest } from "@/app/actions/unlinkChatFromFriendRequest";
import { deleteChatDocument } from "@/app/actions/deleteChatDocument";
import { CHAT_INACTIVITY_TIMEOUT } from "@/lib/config/chatConfig";
import { importPrivateKey } from "@/lib/crypto/rsa";
import { 
  generateSessionAESKey, 
  exportSessionKey, 
  importSessionKey,
  encryptSessionKeyForUser,
  decryptSessionKey 
} from "@/lib/crypto/sessionKey";
import { decryptMessageWithSession } from "@/lib/crypto/messageEncryption";
import MessageComponent from "@/app/components/messageComponent";

interface Message {
  id: string;
  senderId: string;
  encryptedContent: string;
  iv: string;
  createdAt: any;
  type: string;
  text?: string; // For system messages
  decryptedText?: string; // Added after decryption
}

function MessageBox() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.chatid as string;
  const { uid } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatExpired, setChatExpired] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionKeyInitializedRef = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle synthetic friend_ chatIds (used when clicking friend without active chat)
  useEffect(() => {
    if (!chatId || !uid || chatExpired) return;

    // Check if this is a synthetic friend ID
    if (chatId.startsWith("friend_")) {
      const friendRequestId = chatId.replace("friend_", "");
      console.log("🔗 Detected friend request ID, creating/finding chat...");

      let mounted = true;

      (async () => {
        try {
          const result = await ensureChatFromFriendRequest(friendRequestId, uid);
          
          if (!mounted) return;

          if (result.chatId !== chatId) {
            // Navigate to the real chat ID
            console.log(`✅ Navigating to actual chat: ${result.chatId}`);
            router.push(`/chat/${result.chatId}`);
          }
        } catch (error) {
          if (!mounted) return;
          console.error("Failed to create chat from friend request:", error);
          setError("Failed to create chat. Please try again.");
          setLoading(false);
        }
      })();

      return () => {
        mounted = false;
      };
    }
  }, [chatId, uid, chatExpired, router]);

  // Consolidated: Initialize chat session (checks expiry + gets session key in single optimized call)
  useEffect(() => {
    if (!chatId || !uid || chatId.startsWith("friend_")) return;

    let isMounted = true;

    async function initChatSession() {
      try {
        if (!uid) {
          throw new Error("User not authenticated");
        }
        
        console.log("🚀 Initializing chat session (optimized single read):", chatId);
        
        // Single consolidated call that checks expiry and gets session data
        const result = await initializeChatSession(chatId, uid);
        
        if (!isMounted) return;

        if (!result.success) {
          console.error("❌ Chat initialization failed:", result.error);
          router.replace("/chat");
          return;
        }

        // Handle chat expiry
        if (result.chatExpired) {
          console.log("⏰ Chat has expired");
          setChatExpired(true);
          setLoading(false);
          return;
        }

        // Handle chat recreation
        if (result.recreated) {
          console.log("♻️ Chat was recreated with new ID:", result.chatId);
          router.replace(`/chat/${result.chatId}`);
          return; // Exit and let the new URL trigger re-initialization
        }

        // Use the active chatId (might be new if recreated)
        const activeChatId = result.chatId;
        const sessionData = result.sessionData!;

        // Handle session key generation or decryption
        if (sessionData.isNew) {
          // Type narrowing: when isNew is true, participants exists
          const participants = 'participants' in sessionData ? sessionData.participants : [];
          
          // Need to generate new session key
          console.log("🆕 Generating new session key for participants:", participants);
          
          const newSessionKey = await generateSessionAESKey();
          const sessionKeyBase64 = await exportSessionKey(newSessionKey);

          // Get all participants' public keys
          const encryptedKeys: Record<string, string> = {};

          // Get public keys for all participants
          console.log("🔑 Fetching public keys for participants:", participants);
          const publicKeys = await getUserPublicKeys(participants);
          console.log("✅ Retrieved public keys for:", Object.keys(publicKeys));
          
          for (const participantId of participants) {
            const publicKeyBase64 = publicKeys[participantId];
            
            if (!publicKeyBase64) {
              throw new Error(`Public key not found for participant ${participantId}`);
            }
            
            console.log(`🔐 Encrypting session key for participant: ${participantId}`);
            // Encrypt session key for this participant
            const encryptedForParticipant = await encryptSessionKeyForUser(
              sessionKeyBase64,
              publicKeyBase64
            );
            
            encryptedKeys[`encryptedKey_${participantId}`] = encryptedForParticipant;
            console.log(`✅ Encrypted session key for: ${participantId}`);
          }

          // Store encrypted session keys in Firestore
          console.log("💾 Storing encrypted session keys for all participants");
          const storeResult = await storeSessionKey(activeChatId, encryptedKeys);
          console.log("✅ Session keys stored, session ID:", storeResult.sessionId);

          if (storeResult.alreadyExisted) {
            // Race condition: another user created the session first
            // Re-initialize to get the existing session
            console.log("⚠️ Session already existed, re-fetching chat session");
            
            const retryResult = await initializeChatSession(activeChatId, uid);
            
            if (!isMounted) return;

            if (!retryResult.success || !retryResult.sessionData || retryResult.sessionData.isNew) {
              throw new Error("Race condition error: expected existing session");
            }

            const indexedDB = await getDB();
            const privateKeyPKCS8 = await indexedDB.get("keys", "userPrivateKey");
            
            if (!privateKeyPKCS8 || typeof privateKeyPKCS8 !== 'string') {
              console.error("❌ Private key not found in IndexedDB. User needs to log in again.");
              throw new Error("Private key not found. Please log in again to restore your encryption keys.");
            }

            const privateKey = await importPrivateKey(privateKeyPKCS8);
            const decryptedKeyBase64 = await decryptSessionKey(
              retryResult.sessionData.encryptedSessionKey,
              privateKey
            );
            
            const importedSessionKey = await importSessionKey(decryptedKeyBase64);
            
            if (isMounted) {
              setSessionKey(importedSessionKey);
              console.log("✅ Using existing session key from race condition");
            }
          } else {
            // We successfully created the session
            if (isMounted) {
              setSessionKey(newSessionKey);
              console.log("✅ Using newly created session key");
            }
          }
        } else {
          // Decrypt existing session key
          console.log("🔓 Decrypting existing session key, session ID:", sessionData.sessionId);
          
          const indexedDB = await getDB();
          const privateKeyPKCS8 = await indexedDB.get("keys", "userPrivateKey");
          
          if (!privateKeyPKCS8) {
            throw new Error("Private key not found in IndexedDB. Please log out and log back in.");
          }

          if (typeof privateKeyPKCS8 !== 'string') {
            console.error('Private key in IndexedDB is not a string:', typeof privateKeyPKCS8);
            throw new Error("Private key is corrupted. Please log out and log back in.");
          }

          const privateKey = await importPrivateKey(privateKeyPKCS8);
          console.log("🔐 Decrypting session key with user's private key");
          const decryptedKeyBase64 = await decryptSessionKey(
            sessionData.encryptedSessionKey,
            privateKey
          );
          
          console.log("✅ Session key decrypted successfully");
          const importedSessionKey = await importSessionKey(decryptedKeyBase64);

          if (isMounted) {
            setSessionKey(importedSessionKey);
            console.log("✅ Session key set and ready for encryption/decryption");
          }
        }

        setChatExpired(false);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error initializing chat session:", err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Failed to initialize encryption";
          
          // If chat not found, redirect to /chat with error message
          if (errorMessage.includes("Chat not found") || errorMessage.includes("not found")) {
            router.push("/chat?error=notfound");
            return;
          }
          
          setError(errorMessage);
          setLoading(false);
        }
      }
    }

    initChatSession();

    return () => {
      isMounted = false;
    };
  }, [chatId, uid, router]);

  // Monitor chat for inactivity with real-time expiry detection
  useEffect(() => {
    if (!chatId || !uid || chatExpired || chatId.startsWith("friend_")) return;

    let mounted = true;
    let lastActivityTime: number | null = null;
    console.log("⏰ Setting up inactivity monitor for chat:", chatId);

    const chatDocRef = doc(db, "chats", chatId);
    let unsubscribe: (() => void) | undefined;
    let checkInterval: NodeJS.Timeout | undefined;
    
    // Function to check if chat has expired
    const checkExpiry = () => {
      if (!mounted || !lastActivityTime) return;
      
      const now = Date.now();
      const timeSinceActivity = now - lastActivityTime;

      if (timeSinceActivity > CHAT_INACTIVITY_TIMEOUT) {
        console.log(`⏰ Chat expired: ${Math.floor(timeSinceActivity / 1000)}s since last activity`);
        if (mounted) {
          setChatExpired(true);
          setLoading(false);
        }
      }
    };

    // Verify chat exists before subscribing
    const setupMonitor = async () => {
      try {
        const chatSnapshot = await getDoc(chatDocRef);
        
        if (!mounted || !chatSnapshot.exists()) {
          console.log("⚠️ Chat doesn't exist, skipping monitor setup");
          return;
        }

        // Initialize lastActivityTime
        const initialData = chatSnapshot.data();
        if (initialData.lastActivity) {
          lastActivityTime = initialData.lastActivity.toMillis();
        }

        // Set up Firestore listener to update lastActivityTime
        unsubscribe = onSnapshot(
          chatDocRef,
          (snapshot) => {
            if (!mounted) return;
            if (!snapshot.exists()) {
              console.log("⚠️ Chat document deleted, marking as expired...");
              if (mounted) {
                setChatExpired(true);
                setLoading(false);
              }
              return;
            }

            const chatData = snapshot.data();
            if (chatData.lastActivity) {
              lastActivityTime = chatData.lastActivity.toMillis();
              // Check immediately when activity updates
              checkExpiry();
            }
          },
          (error) => {
            if (!mounted) return;
            console.error("Failed to monitor chat activity:", error);
          }
        );

        // Set up interval to check expiry every second
        // This ensures both users see expiry at roughly the same time
        checkInterval = setInterval(checkExpiry, 1000);
        
      } catch (error) {
        if (!mounted) return;
        console.log("Could not setup monitor:", error);
      }
    };

    setupMonitor();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [chatId, uid, chatExpired]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!chatId || !sessionKey || chatExpired || chatId.startsWith("friend_")) return;

    let mounted = true;
    console.log("👂 Setting up real-time message listener");

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!mounted) return;
      
      const fetchedMessages: Message[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        fetchedMessages.push({
          id: doc.id,
          senderId: data.senderId,
          encryptedContent: data.encryptedContent,
          iv: data.iv,
          createdAt: data.createdAt,
          type: data.type || "text",
          text: data.text, // For system messages
        });
      }

      // Decrypt all messages
      const decryptedMessages = await Promise.all(
        fetchedMessages.map(async (msg) => {
          try {
            if (msg.type === "text" && msg.encryptedContent && msg.iv) {
              const decrypted = await decryptMessageWithSession(
                msg.encryptedContent,
                msg.iv,
                sessionKey
              );
              return { ...msg, decryptedText: decrypted };
            } else if (msg.type === "friend_connected" || msg.type === "chat_recreated") {
              // System messages (not encrypted)
              return { ...msg, decryptedText: msg.text || "System message" };
            }
            return msg;
          } catch (err) {
            console.error("Failed to decrypt message:", msg.id, err);
            return { ...msg, decryptedText: "[Decryption failed]" };
          }
        })
      );

      if (mounted) {
        setMessages(decryptedMessages);
      }
    });

    return () => {
      mounted = false;
      console.log("🔇 Unsubscribing from messages");
      unsubscribe();
    };
  }, [chatId, sessionKey, chatExpired]);

  // 5-second loading before auto-cleanup
  useEffect(() => {
    if (!chatExpired || !uid || !chatId || chatId.startsWith("friend_")) return;

    let mounted = true;
    console.log("⏰ Starting 5-second cleanup process...");
    setIsCleaningUp(true);

    // After 5 seconds, immediately delete chat document and unlink
    const cleanupTimeout = setTimeout(async () => {
      if (!mounted) return;
      
      console.log("🗑️ Timer complete - immediately deleting chat document...");
      
      // Delete chat document - this triggers real-time push updates to chat list
      await deleteChatDocument(chatId, uid);
      
      console.log("🔗 Unlinking expired chat from friend requests...");
      await unlinkChatFromFriendRequest(chatId, uid);
      
      if (mounted) {
        console.log("↩️ Redirecting to chat list...");
        router.push("/chat");
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(cleanupTimeout);
    };
  }, [chatExpired, chatId, uid, router]);

  // Handle expired chat with loading
  if (chatExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Chat Expired</h2>
          <p className="text-gray-600 mb-4">
            This chat has been inactive for too long and has expired for security reasons.
          </p>
          {isCleaningUp ? (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Cleaning up and preparing fresh encryption keys...
              </p>
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to chat list...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">Setting up secure connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-10">
      {messages.map((msg) => (
        <MessageComponent
          key={msg.id}
          messageText={msg.decryptedText || "[Encrypted]"}
          from={msg.senderId === uid ? "send" : "receive"}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageBox;