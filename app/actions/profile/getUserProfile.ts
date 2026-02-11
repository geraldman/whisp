"use client";

import { db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getUserProfile(uid: string) {
  if (!uid) {
    throw new Error("User ID is required");
  }

  try {
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    return {
      avatar: userData?.avatar || "/window.svg",
      email: userData?.email,
      username: userData?.username,
      numericId: userData?.numericId,
    };
  } catch (error: any) {
    console.error("Get user profile error:", error);
    throw new Error("Failed to get user profile");
  }
}
