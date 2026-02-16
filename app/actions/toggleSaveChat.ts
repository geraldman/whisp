"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";

/**
 * Toggle the saved status of a chat
 * Saved chats are permanent and won't be deleted by cleanup
 * @param chatId - The ID of the chat
 * @param uid - The current user's ID (for authorization)
 * @param saved - New saved status (true = saved, false = not saved)
 */
export async function toggleSaveChat(
  chatId: string,
  uid: string,
  saved: boolean
) {
  if (!chatId || !uid) {
    throw new Error("Invalid chat ID or user ID");
  }

  // Verify user is a participant of this chat
  const chatRef = adminDb.collection("chats").doc(chatId);
  const chatSnap = await chatRef.get();

  if (!chatSnap.exists) {
    throw new Error("Chat not found");
  }

  const chatData = chatSnap.data();
  
  if (!chatData || !chatData.participants || !chatData.participants.includes(uid)) {
    throw new Error("Chat not found");
  }

  // Update the saved status
  await chatRef.update({
    saved,
  });

  return { success: true, saved };
}
