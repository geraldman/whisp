"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useChatSession } from "@/lib/hooks/useChatSession";
import { setupPresenceCleanupListener } from "@/app/actions/chat/cleanupSession";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { 
  encryptMessageWithSession, 
  decryptMessageWithSession 
} from "@/lib/crypto/messageEncryption";
import MessageComponent from "@/app/components/messageComponent";
import MessageInput from "@/app/components/messageinput";

interface Message {
  id: string;
  senderId: string;
  encryptedContent: string;
  iv: string;
  timestamp: any;
  sessionId: string;
}

interface DecryptedMessage extends Message {
  decryptedContent: string;
}

export default function ChatMessages({ 
  chatId, 
  otherUserId 
}: { 
  chatId: string; 
  otherUserId: string;
}) {
  const { user } = useAuth();
  const { sessionKey, sessionId, loading: sessionLoading, error: sessionError } = useChatSession(chatId, user?.uid || null);
  
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Setup cleanup listener for when both users go offline
  useEffect(() => {
    if (!user || !chatId || !otherUserId) return;
    
    const unsubscribe = setupPresenceCleanupListener(
      chatId,
      user.uid,
      otherUserId
    );
    
    return unsubscribe;
  }, [chatId, user, otherUserId]);
  
  // Listen to messages and decrypt them
  useEffect(() => {
    if (!chatId || !sessionKey || !sessionId) return;
    
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const encryptedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      // Decrypt all messages
      const decrypted = await Promise.all(
        encryptedMessages.map(async (msg) => {
          try {
            const decryptedContent = await decryptMessageWithSession(
              msg.encryptedContent,
              msg.iv,
              sessionKey
            );
            return { ...msg, decryptedContent };
          } catch (error) {
            console.error("Failed to decrypt message:", error);
            return { ...msg, decryptedContent: "[Failed to decrypt]" };
          }
        })
      );
      
      setMessages(decrypted);
    });
    
    return unsubscribe;
  }, [chatId, sessionKey, sessionId]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Send encrypted message
  const handleSendMessage = async (messageText: string) => {
    if (!user || !sessionKey || !sessionId) return;
    
    const { encryptedContent, iv } = await encryptMessageWithSession(
      messageText,
      sessionKey
    );
    
    const messagesRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesRef, {
      senderId: user.uid,
      encryptedContent,
      iv,
      sessionId,
      timestamp: serverTimestamp()
    });
  };
  
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Initializing secure session...</div>
      </div>
    );
  }
  
  if (sessionError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {sessionError}</div>
      </div>
    );
  }
  
  if (!sessionKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Waiting for both users to be online...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
            <p className="text-sm mt-2">Messages will disappear when both users log out.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
             MessageComponent
              key={msg.id}
              messageText={msg.decryptedContent}
              from={msg.senderId === user?.uid ? "send" : "receive"}
              timestamp={msg.timestamp?.toDate?.()?.toLocaleTimeString() || "Sending..."}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!sessionKey}
      /
}
