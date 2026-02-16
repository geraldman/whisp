"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { randomUUID } from "crypto";

export async function acceptFriendRequest(requestId: string) {
  if (!requestId) {
    throw new Error("Invalid request id");
  }

  const requestRef = adminDb.collection("friend_requests").doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new Error("Friend request not found");
  }

  const data = requestSnap.data();

  if (!data) {
    throw new Error("Friend request data is missing");
  }

  if (data.status !== "pending") {
    throw new Error("Request already handled");
  }

  const { from, to } = data;

  // 1️⃣ CREATE CHAT NOW (when accepting)
  const chatId = randomUUID();

  await adminDb.collection("chats").doc(chatId).set({
    participants: [from, to],
    isFriendChat: true, // Already unlocked since it's accepted
    maxMessages: null, // Unlimited messages
    createdAt: new Date(),
    lastActivity: new Date(), // Track last activity for cleanup
    saved: false, // Chat can be cleaned up - friend relationship persists in friend_requests
  });

  // 2️⃣ Update friend request with chatId
  await requestRef.update({
    status: "accepted",
    chatId,
    acceptedAt: new Date(),
  });

  // 3️⃣ Add SYSTEM MESSAGE to chat history
  await adminDb
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .add({
      senderId: "system",
      type: "friend_connected",
      text: `You are now connected`,
      participants: [from, to],
      createdAt: new Date(),
    });

  // 4️⃣ Return data for client
  return {
    success: true,
    chatId,
    connectedUserId: from, // user who sent the request
  };
}
