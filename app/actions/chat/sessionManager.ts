"use client";

import { db } from "@/lib/firebase/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { randomUUID } from "crypto";

export interface ChatSession {
  sessionId: string;
  chatId: string;
  createdAt: any;
  createdBy: string;
  aesKeyEncrypted: {
    [userId: string]: string;
  };
  status: "active" | "expired";
}

/**
 * Create a new chat session with encrypted AES keys
 */
export async function createChatSession(
  chatId: string,
  createdBy: string,
  encryptedKeys: { [userId: string]: string }
): Promise<string> {
  const sessionId = randomUUID();
  
  const sessionData: ChatSession = {
    sessionId,
    chatId,
    createdAt: serverTimestamp(),
    createdBy,
    aesKeyEncrypted: encryptedKeys,
    status: "active",
  };
  
  // Store session document
  await setDoc(
    doc(db, "chats", chatId, "sessions", sessionId),
    sessionData
  );
  
  // Update chat document with current session ID
  await updateDoc(doc(db, "chats", chatId), {
    currentSessionId: sessionId,
  });
  
  return sessionId;
}

/**
 * Get active session for a chat
 */
export async function getActiveSession(chatId: string): Promise<ChatSession | null> {
  // Get current session ID from chat document
  const chatDoc = await getDoc(doc(db, "chats", chatId));
  
  if (!chatDoc.exists()) {
    return null;
  }
  
  const currentSessionId = chatDoc.data().currentSessionId;
  
  if (!currentSessionId) {
    return null;
  }
  
  // Get session document
  const sessionDoc = await getDoc(
    doc(db, "chats", chatId, "sessions", currentSessionId)
  );
  
  if (!sessionDoc.exists()) {
    return null;
  }
  
  const sessionData = sessionDoc.data() as ChatSession;
  
  // Check if session is active
  if (sessionData.status !== "active") {
    return null;
  }
  
  return sessionData;
}

/**
 * Get encrypted session key for a specific user
 */
export async function getEncryptedSessionKeyForUser(
  chatId: string,
  sessionId: string,
  userId: string
): Promise<string | null> {
  const sessionDoc = await getDoc(
    doc(db, "chats", chatId, "sessions", sessionId)
  );
  
  if (!sessionDoc.exists()) {
    return null;
  }
  
  const sessionData = sessionDoc.data() as ChatSession;
  return sessionData.aesKeyEncrypted[userId] || null;
}

/**
 * Expire a session (mark as expired)
 */
export async function expireSession(chatId: string, sessionId: string): Promise<void> {
  await updateDoc(
    doc(db, "chats", chatId, "sessions", sessionId),
    {
      status: "expired",
    }
  );
}

/**
 * Check if a session exists and is active
 */
export async function isSessionActive(chatId: string, sessionId: string): Promise<boolean> {
  const sessionDoc = await getDoc(
    doc(db, "chats", chatId, "sessions", sessionId)
  );
  
  if (!sessionDoc.exists()) {
    return false;
  }
  
  const sessionData = sessionDoc.data() as ChatSession;
  return sessionData.status === "active";
}
