"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { randomUUID } from "crypto";

/**
 * Creates or finds a chat for a friend request relationship.
 * Used when accessing a chat after the chatId has been unlinked.
 */
export async function ensureChatFromFriendRequest(
  friendRequestId: string,
  currentUserId: string
) {
  if (!friendRequestId || !currentUserId) {
    throw new Error("Invalid friend request id or user id");
  }

  // Get the friend request
  const friendRequestRef = adminDb.collection("friend_requests").doc(friendRequestId);
  const friendRequestSnap = await friendRequestRef.get();

  if (!friendRequestSnap.exists) {
    throw new Error("Friend request not found");
  }

  const friendRequestData = friendRequestSnap.data();
  
  if (!friendRequestData || friendRequestData.status !== "accepted") {
    throw new Error("Friend request is not accepted");
  }

  const { from, to } = friendRequestData;

  // Verify current user is a participant
  if (from !== currentUserId && to !== currentUserId) {
    throw new Error("Friend request not found");
  }

  // Check if friend request already has a chatId
  if (friendRequestData.chatId) {
    // Check if that chat still exists
    const chatRef = adminDb.collection("chats").doc(friendRequestData.chatId);
    const chatSnap = await chatRef.get();
    
    if (chatSnap.exists) {
      const data = chatSnap.data();
      return {
        exists: true,
        recreated: false,
        chatId: friendRequestData.chatId,
        chatData: {
          ...data,
          createdAt: data?.createdAt?.toMillis?.() ?? null,
          lastActivity: data?.lastActivity?.toMillis?.() ?? null,
        },
      };
    }
  }

  // Create a new chat
  const newChatId = randomUUID();

  await adminDb.collection("chats").doc(newChatId).set({
    participants: [from, to],
    isFriendChat: true,
    maxMessages: null,
    createdAt: new Date(),
    lastActivity: new Date(),
    saved: false,
  });

  // Update the friend request with the new chatId
  await friendRequestRef.update({
    chatId: newChatId,
    chatRecreatedAt: new Date(),
  });

  // Add a system message
  await adminDb
    .collection("chats")
    .doc(newChatId)
    .collection("messages")
    .add({
      senderId: "system",
      type: "chat_created",
      text: "Secure chat created with fresh encryption keys",
      participants: [from, to],
      createdAt: new Date(),
    });

  const now = Date.now();
  
  return {
    exists: false,
    recreated: true,
    chatId: newChatId,
    chatData: {
      participants: [from, to],
      isFriendChat: true,
      maxMessages: null,
      createdAt: now,
      lastActivity: now,
      saved: false,
    },
  };
}
