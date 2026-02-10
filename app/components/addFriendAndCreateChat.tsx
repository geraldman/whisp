"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";

export async function addFriendAndCreateChat(
  currentUid: string,
  targetUid: string
) {
  if (!currentUid || !targetUid || currentUid === targetUid) {
    throw new Error("Invalid user");
  }

  // 1️⃣ Cek chat existing
  const snapshot = await adminDb
    .collection("chats")
    .where("participants", "array-contains", currentUid)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.participants.includes(targetUid)) {
      return { chatId: doc.id };
    }
  }

  // 2️⃣ Generate chatId AMAN
  const chatRef = adminDb.collection("chats").doc();
  const chatId = chatRef.id;

  // 3️⃣ Create chat
  await chatRef.set({
    participants: [currentUid, targetUid],
    isFriendChat: false,
    maxMessages: 1,
    createdAt: new Date(),
  });

  // 4️⃣ Create friend request
  await adminDb.collection("friend_requests").add({
    from: currentUid,
    to: targetUid,
    status: "pending",
    chatId,
    createdAt: new Date(),
  });

  return { chatId };
}
