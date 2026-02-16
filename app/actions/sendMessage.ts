"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Send an encrypted message to a chat.
 * Message should already be encrypted on the client side.
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  encryptedContent: string,
  iv: string
) {
  if (!chatId || !senderId || !encryptedContent || !iv) {
    throw new Error("Invalid message parameters");
  }

  const chatRef = adminDb.collection("chats").doc(chatId);
  const chatSnap = await chatRef.get();

  if (!chatSnap.exists) {
    throw new Error("Chat not found");
  }

  const chatData = chatSnap.data();
  const participants = chatData?.participants || [];

  // Verify sender is a participant
  if (!participants.includes(senderId)) {
    throw new Error("Chat not found");
  }

  // Add message to messages subcollection
  const messageRef = await chatRef.collection("messages").add({
    senderId,
    encryptedContent, // Encrypted message content
    iv, // Initialization vector for AES decryption
    createdAt: FieldValue.serverTimestamp(),
    type: "text", // Could expand to support other types
  });

  // Update chat's lastActivity timestamp
  await chatRef.update({
    lastActivity: FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    messageId: messageRef.id,
  };
}
