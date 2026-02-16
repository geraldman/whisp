"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";

/**
 * Get a user's public key from Firestore
 */
export async function getUserPublicKey(userId: string) {
  if (!userId) {
    throw new Error("Invalid user id");
  }

  const userDoc = await adminDb.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  
  return {
    publicKey: userData?.publicKey,
    userId,
  };
}

/**
 * Get multiple users' public keys at once
 */
export async function getUserPublicKeys(userIds: string[]) {
  if (!userIds || userIds.length === 0) {
    throw new Error("Invalid user ids");
  }

  const publicKeys: Record<string, string> = {};

  for (const userId of userIds) {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      publicKeys[userId] = userData?.publicKey || "";
    }
  }

  return publicKeys;
}
