"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  getDB, 
  getCachedUserData, 
  cacheUserData,
  getCachedActiveSession,
  cacheActiveSession 
} from "@/lib/db/indexeddb";
import { 
  getActiveSession, 
  createChatSession,
  getEncryptedSessionKeyForUser 
} from "@/app/actions/chat/sessionManager";
import { 
  generateSessionAESKey, 
  exportSessionKey, 
  encryptSessionKeyForUser,
  decryptSessionKey,
  importSessionKey 
} from "@/lib/crypto/sessionKey";
import { areBothUsersOnline } from "@/lib/firebase/presence";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export function useChatSession(chatId: string | null, currentUserId: string | null) {
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeSession = useCallback(async () => {
    if (!chatId || !currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get chat participants
      const chatDoc = await getDoc(doc(db, "chats", chatId));
      if (!chatDoc.exists()) {
        throw new Error("Chat not found");
      }

      const participants = chatDoc.data().participants as string[];
      const otherUserId = participants.find(id => id !== currentUserId);
      
      if (!otherUserId) {
        throw new Error("Other participant not found");
      }

      // Check cache first for active session
      const cachedSession = await getCachedActiveSession(chatId);
      let activeSession = null;
      
      if (cachedSession) {
        console.log("Using cached session from IndexedDB");
        // Verify session is still valid in Firestore (lightweight check)
        activeSession = await getActiveSession(chatId);
        if (activeSession?.sessionId !== cachedSession.sessionId) {
          console.log("Cached session outdated, fetching new");
        }
      } else {
        activeSession = await getActiveSession(chatId);
      }

      // Check if both users are online
      const bothOnline = await areBothUsersOnline(currentUserId, otherUserId);

      // If no active session or both were offline, create new session
      if (!activeSession || !bothOnline) {
        console.log("Creating new session...");
        
        // Generate new AES session key
        const newSessionKey = await generateSessionAESKey();
        const sessionKeyBase64 = await exportSessionKey(newSessionKey);

        // Get both users' public keys - check cache first
        let currentUserPubKey: string | undefined;
        let otherUserPubKey: string | undefined;
        
        // Try cache for current user
        const cachedCurrentUser = await getCachedUserData(currentUserId);
        if (cachedCurrentUser) {
          currentUserPubKey = cachedCurrentUser.publicKey;
          console.log("Using cached public key for current user");
        } else {
          const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
          currentUserPubKey = currentUserDoc.data()?.publicKey;
          if (currentUserPubKey) {
            await cacheUserData(currentUserId, currentUserPubKey, currentUserDoc.data()?.salt);
          }
        }
        
        // Try cache for other user
        const cachedOtherUser = await getCachedUserData(otherUserId);
        if (cachedOtherUser) {
          otherUserPubKey = cachedOtherUser.publicKey;
          console.log("Using cached public key for other user");
        } else {
          const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
          otherUserPubKey = otherUserDoc.data()?.publicKey;
          if (otherUserPubKey) {
            await cacheUserData(otherUserId, otherUserPubKey, otherUserDoc.data()?.salt);
          }
        }

        if (!currentUserPubKey || !otherUserPubKey) {
          throw new Error("User public keys not found");
        }

        // Encrypt session key for both users
        const encryptedForCurrent = await encryptSessionKeyForUser(
          sessionKeyBase64,
          currentUserPubKey
        );
        const encryptedForOther = await encryptSessionKeyForUser(
          sessionKeyBase64,
          otherUserPubKey
        );

        // Create new session in Firestore
        const newSessionId = await createChatSession(
          chatId,
          currentUserId,
          {
            [currentUserId]: encryptedForCurrent,
            [otherUserId]: encryptedForOther,
          }
        );
        
        // Cache the session for faster future access
        await cacheActiveSession(chatId, newSessionId, encryptedForCurrent);

        setSessionKey(newSessionKey);
        setSessionId(newSessionId);
      } else {
        // Use existing session
        console.log("Using existing session:", activeSession.sessionId);
        
        // Try to get encrypted key from cache first
        let encryptedKey: string | null = null;
        if (cachedSession && cachedSession.sessionId === activeSession.sessionId) {
          encryptedKey = cachedSession.encryptedKey;
          console.log("Using cached encrypted session key");
        } else {
          // Get encrypted session key for current user from Firestore
          encryptedKey = await getEncryptedSessionKeyForUser(
            chatId,
            activeSession.sessionId,
            currentUserId
          );
          
          // Cache it for next time
          if (encryptedKey) {
            await cacheActiveSession(chatId, activeSession.sessionId, encryptedKey);
          }
        }

        if (!encryptedKey) {
          throw new Error("Session key not found for user");
        }

        // Get private key from IndexedDB
        const idb = await getDB();
        const privateKey = await idb.get("keys", "userPrivateKey");

        if (!privateKey) {
          throw new Error("Private key not found in IndexedDB");
        }

        // Decrypt session key
        const decryptedKeyBase64 = await decryptSessionKey(encryptedKey, privateKey);
        const decryptedKey = await importSessionKey(decryptedKeyBase64);

        setSessionKey(decryptedKey);
        setSessionId(activeSession.sessionId);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error initializing session:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return { 
    sessionKey, 
    sessionId, 
    loading, 
    error,
    reinitializeSession: initializeSession 
  };
}
