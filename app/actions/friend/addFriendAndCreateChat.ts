"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { randomUUID } from "crypto";

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

  if (!fromUser) {
    throw new Error("User data is missing");
  }

  const fromUsername = fromUser.username;
  // 1️⃣ CEK CHAT SUDAH ADA ATAU BELUM
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

  // Kalau chat sudah ada → langsung return
  if (existingChatId) {
    return { chatId: existingChatId };
  }

  // 2️⃣ CREATE CHAT BARU (1 BUBBLE LIMIT)
  const chatId = randomUUID();

  await adminDb.collection("chats").doc(chatId).set({
    participants: [currentUid, targetUid],
    isFriendChat: false,
    maxMessages: 1,
    createdAt: new Date(),
  });

  // 3️⃣ CREATE FRIEND REQUEST
  await adminDb.collection("friend_requests").add({
    from: currentUid,
    fromUsername,
    to: targetUid,
    status: "pending",
    chatId,
    createdAt: new Date(),
  });

  return { chatId };
}
