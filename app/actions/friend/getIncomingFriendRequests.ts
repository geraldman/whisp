"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { unstable_noStore as noStore } from "next/cache";

export async function getIncomingFriendRequests(uid: string) {
  noStore();

  if (!uid) return [];

  const snapshot = await adminDb
    .collection("friend_requests")
    .where("to", "==", uid)
    .where("status", "==", "pending")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      from: data.from,
      fromUsername: data.fromUsername ?? null,
      to: data.to,
      status: data.status,
      chatId: data.chatId,
      // 🔥 SERIALIZE Timestamp
      createdAt: data.createdAt
        ? data.createdAt.toMillis()
        : null,
    };
  });
}
