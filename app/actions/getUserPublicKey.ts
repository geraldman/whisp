"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";

/**
 * Returns the RSA public key used to wrap session AES keys for a single recipient.
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
 * Loads public keys for multiple recipients.
 * Note: this currently performs sequential reads; acceptable for small participant sets.
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
