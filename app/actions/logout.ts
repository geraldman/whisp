"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { deleteDB } from "@/lib/db/indexeddb";

export async function logout() {
  try {
    // 1. Completely delete IndexedDB (all crypto material and cached data)
    await deleteDB();
    
    // 2. Firebase sign out
    await signOut(auth);
    
    console.log("Logout: Successfully logged out and cleared all local data");
  } catch (error) {
    console.error("Logout: Error during logout", error);
    // Still attempt Firebase sign out even if IndexedDB deletion fails
    await signOut(auth);
  }
}
