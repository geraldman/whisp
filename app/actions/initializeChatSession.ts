"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { randomUUID } from "crypto";
import { CHAT_INACTIVITY_TIMEOUT } from "@/lib/config/chatConfig";

interface InitializeChatSessionResult {
  success: boolean;
  chatExists: boolean;
  chatExpired: boolean;
  chatId: string;
  oldChatId?: string;
  recreated: boolean;
  chatData?: {
    participants: string[];
    isFriendChat: boolean;
    maxMessages: number | null;
    createdAt: number;
    lastActivity: number;
    saved: boolean;
  };
  sessionData?: {
    sessionId: string;
    encryptedSessionKey: string;
    isNew: boolean;
  } | {
    sessionId: null;
    encryptedSessionKey: null;
    isNew: true;
    participants: string[];
  };
  error?: string;
}

/**
 * Consolidated chat initialization that combines chat verification, expiry check, 
 * and session key retrieval into a single optimized call.
 * Reduces multiple round-trips by returning both chat and crypto-session readiness in one response.
 */
export async function initializeChatSession(
  chatId: string,
  currentUserId: string
): Promise<InitializeChatSessionResult> {
  if (!chatId || !currentUserId) {
    return {
      success: false,
      chatExists: false,
      chatExpired: false,
      chatId: "",
      recreated: false,
      error: "Invalid chat id or user id"
    };
  }

  // Single read of chat document
  const chatRef = adminDb.collection("chats").doc(chatId);
  const chatSnap = await chatRef.get();

  // CASE 1: Chat exists -> authorize participant, evaluate inactivity expiry, then resolve latest session.
  if (chatSnap.exists) {
    const chatData = chatSnap.data();
    const participants = chatData?.participants || [];

    // Verify user is a participant
    if (!participants.includes(currentUserId)) {
      return {
        success: false,
        chatExists: false,
        chatExpired: false,
        chatId: "",
        recreated: false,
        error: "Chat not found"
      };
    }

    // Check if expired
    const lastActivity = chatData?.lastActivity;
    let isExpired = false;
    
    if (lastActivity) {
      const lastActivityTime = lastActivity.toMillis();
      const now = Date.now();
      const timeSinceActivity = now - lastActivityTime;
      isExpired = timeSinceActivity > CHAT_INACTIVITY_TIMEOUT;
    }

    if (isExpired) {
      return {
        success: true,
        chatExists: true,
        chatExpired: true,
        chatId,
        recreated: false,
        chatData: {
          participants,
          isFriendChat: chatData?.isFriendChat || false,
          maxMessages: chatData?.maxMessages || null,
          createdAt: chatData?.createdAt?.toMillis?.() ?? Date.now(),
          lastActivity: chatData?.lastActivity?.toMillis?.() ?? Date.now(),
          saved: chatData?.saved || false,
        }
      };
    }

    // Chat is valid; newest session doc carries per-user wrapped AES keys.
    const sessionsRef = chatRef.collection("sessions");
    const sessionSnapshot = await sessionsRef
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    let sessionData;
    if (!sessionSnapshot.empty) {
      // The server stores one encrypted key blob per participant field: encryptedKey_<uid>.
      const sessionDoc = sessionSnapshot.docs[0];
      const sessionDocData = sessionDoc.data();
      const encryptedKeyForUser = sessionDocData[`encryptedKey_${currentUserId}`];

      if (!encryptedKeyForUser) {
        return {
          success: false,
          chatExists: true,
          chatExpired: false,
          chatId,
          recreated: false,
          error: "Session key not found for this user"
        };
      }

      sessionData = {
        sessionId: sessionDoc.id,
        encryptedSessionKey: encryptedKeyForUser,
        isNew: false,
      };
    } else {
      // No session yet: client will generate AES key and upload wrapped copies for all participants.
      sessionData = {
        sessionId: null,
        encryptedSessionKey: null,
        isNew: true as const,
        participants,
      };
    }

    return {
      success: true,
      chatExists: true,
      chatExpired: false,
      chatId,
      recreated: false,
      chatData: {
        participants,
        isFriendChat: chatData?.isFriendChat || false,
        maxMessages: chatData?.maxMessages || null,
        createdAt: chatData?.createdAt?.toMillis?.() ?? Date.now(),
        lastActivity: chatData?.lastActivity?.toMillis?.() ?? Date.now(),
        saved: chatData?.saved || false,
      },
      sessionData,
    };
  }

  // CASE 2: Chat missing -> recover from accepted friend relationship, or recreate if needed.

  // Try to find friend request with this chatId
  let friendRequestsSnapshot = await adminDb
    .collection("friend_requests")
    .where("chatId", "==", chatId)
    .where("status", "==", "accepted")
    .limit(1)
    .get();

  // Fallback by user allows recovery when route holds stale chatId after expiration/recreation.
  if (friendRequestsSnapshot.empty) {
    const fromSnapshot = await adminDb
      .collection("friend_requests")
      .where("from", "==", currentUserId)
      .where("status", "==", "accepted")
      .get();
    
    const toSnapshot = await adminDb
      .collection("friend_requests")
      .where("to", "==", currentUserId)
      .where("status", "==", "accepted")
      .get();
    
    const allDocs = [...fromSnapshot.docs, ...toSnapshot.docs];
    const noChatIdDoc = allDocs.find((doc) => {
      const data = doc.data();
      return !data.chatId;
    });

    const exactChatIdDoc = allDocs.find((doc) => {
      const data = doc.data();
      return data.chatId === chatId;
    });

    const differentChatIdDoc = allDocs.find((doc) => {
      const data = doc.data();
      return typeof data.chatId === "string" && data.chatId && data.chatId !== chatId;
    });

    // If relationship already points to a newer chat, return it to heal stale client routes.
    if (differentChatIdDoc) {
      const data = differentChatIdDoc.data();
      const latestChatId = data.chatId as string;
      const latestChatSnap = await adminDb.collection("chats").doc(latestChatId).get();

      if (latestChatSnap.exists) {
        return {
          success: true,
          chatExists: true,
          chatExpired: false,
          chatId: latestChatId,
          oldChatId: chatId,
          recreated: true,
        };
      }
    }

    const matchingDoc = exactChatIdDoc || noChatIdDoc || differentChatIdDoc;
    
    if (!matchingDoc) {
      return {
        success: false,
        chatExists: false,
        chatExpired: false,
        chatId: "",
        recreated: false,
        error: "Chat not found. This chat may have been deleted or you don't have permission to access it."
      };
    }
    
    friendRequestsSnapshot = {
      empty: false,
      docs: [matchingDoc]
    } as any;
  }

  const friendRequestDoc = friendRequestsSnapshot.docs[0];
  const friendRequestData = friendRequestDoc.data();
  const { from, to } = friendRequestData;

  // Verify current user is a participant
  if (from !== currentUserId && to !== currentUserId) {
    return {
      success: false,
      chatExists: false,
      chatExpired: false,
      chatId: "",
      recreated: false,
      error: "Chat not found"
    };
  }

  // Recreate chat shell only; actual session key material is generated client-side per device flow.
  const newChatId = randomUUID();
  const now = new Date();

  await adminDb.collection("chats").doc(newChatId).set({
    participants: [from, to],
    isFriendChat: true,
    maxMessages: null,
    createdAt: now,
    lastActivity: now,
    saved: false,
  });

  // Update friend request
  await friendRequestDoc.ref.update({
    chatId: newChatId,
    chatRecreatedAt: now,
  });

  // Add system message
  await adminDb
    .collection("chats")
    .doc(newChatId)
    .collection("messages")
    .add({
      senderId: "system",
      type: "chat_recreated",
      text: "Chat recreated with new encryption keys",
      participants: [from, to],
      createdAt: now,
    });

  const nowMillis = now.getTime();

  return {
    success: true,
    chatExists: false,
    chatExpired: false,
    chatId: newChatId,
    oldChatId: chatId,
    recreated: true,
    chatData: {
      participants: [from, to],
      isFriendChat: true,
      maxMessages: null,
      createdAt: nowMillis,
      lastActivity: nowMillis,
      saved: false,
    },
    sessionData: {
      sessionId: null,
      encryptedSessionKey: null,
      isNew: true as const,
      participants: [from, to],
    },
  };
}
