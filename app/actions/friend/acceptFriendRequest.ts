"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";

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

  const { chatId, from, to } = data;

  // 1️⃣ Update friend request
  await requestRef.update({
    status: "accepted",
    acceptedAt: new Date(),
  });

  // 2️⃣ Unlock chat
  await adminDb.collection("chats").doc(chatId).update({
    isFriendChat: true,
    maxMessages: null,
    unlockedAt: new Date(),
  });

  // 3️⃣ Tambahkan SYSTEM MESSAGE ke history chat
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

  // 4️⃣ Return data untuk client animation
  return {
    success: true,
    chatId,
    connectedUserId: from, // user yang request
  };
}
