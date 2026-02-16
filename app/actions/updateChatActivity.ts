"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";

/**
 * Updates the lastActivity timestamp of a chat.
 * Call this whenever a message is sent to keep the chat active.
 */
export async function updateChatActivity(chatId: string) {
  if (!chatId) {
    throw new Error("Invalid chat id");
  }

  const chatRef = adminDb.collection("chats").doc(chatId);
  const chatSnap = await chatRef.get();

  if (!chatSnap.exists) {
    throw new Error("Chat not found");
  }

  await chatRef.update({
    lastActivity: new Date(),
  });

  return { success: true };
}
