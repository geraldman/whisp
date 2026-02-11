"use client";

import { db } from "@/lib/firebase/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function updateAvatar(uid: string, avatar: string) {
  if (!uid) {
    throw new Error("User ID is required");
  }

  if (!avatar) {
    throw new Error("Avatar is required");
  }

  try {
    // Update avatar in Firestore
    await updateDoc(doc(db, "users", uid), {
      avatar,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update avatar error:", error);
    throw new Error("Failed to update avatar");
  }
}
