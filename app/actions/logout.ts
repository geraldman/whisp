"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { getDB } from "@/lib/db/indexeddb";

export async function logout() {
  // 1. Firebase sign out
  await signOut(auth);

  // 2. Clear IndexedDB crypto material
  const db = await getDB();
  await db.delete("keys", "userPrivateKey");

  // (opsional tapi disarankan)
  await db.clear("keys");
}
