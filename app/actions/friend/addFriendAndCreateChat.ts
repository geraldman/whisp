"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";

export async function addFriendAndCreateChat(
  currentUid: string,
  targetUid: string
) {
  if (!currentUid || !targetUid || currentUid === targetUid) {
    throw new Error("Invalid user");
  }

  const userSnap = await adminDb
    .collection("users")
    .doc(currentUid)
    .get();

  if (!userSnap.exists) {
    throw new Error("Current user not found");
  }

  const fromUser = userSnap.data();
  const fromUsername = fromUser.username;

  // 1️⃣ Check if there's already a pending request or existing chat
  const existingRequestQuery = await adminDb
    .collection("friend_requests")
    .where("from", "==", currentUid)
    .where("to", "==", targetUid)
    .where("status", "==", "pending")
    .get();

  if (!existingRequestQuery.empty) {
    throw new Error("Friend request already sent");
  }

  // Check if chat already exists between these users
  const chatQuery = await adminDb
    .collection("chats")
    .where("participants", "array-contains", currentUid)
    .get();

  let existingChatId: string | null = null;

  chatQuery.forEach((doc) => {
    const data = doc.data();
    if (data.participants.includes(targetUid)) {
      existingChatId = doc.id;
    }
  });

  // If chat exists, return it (already friends)
  if (existingChatId) {
    return { success: true, chatId: existingChatId, alreadyFriends: true };
  }

  // 2️⃣ CREATE FRIEND REQUEST ONLY (no chat yet)
  await adminDb.collection("friend_requests").add({
    from: currentUid,
    fromUsername,
    to: targetUid,
    status: "pending",
    createdAt: new Date(),
  });

  return { success: true, requestSent: true };
}
