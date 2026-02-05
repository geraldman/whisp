"use server";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export async function searchUserByNumericId(numericId: string) {
  // 1. lookup numeric index
  const indexRef = doc(db, "user_numeric_index", numericId);
  const indexSnap = await getDoc(indexRef);

  if (!indexSnap.exists()) {
    return { found: false };
  }

  const { uid } = indexSnap.data();

  // 2. fetch user profile
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // DATA CORRUPTION (should never happen)
    throw new Error("User index exists but profile missing");
  }

  const data = userSnap.data();

  // 3. return sanitized profile
  return {
    found: true,
    user: {
      uid: data.uid,
      numericId: data.numericId,
      username: data.username,
    },
  };
}
