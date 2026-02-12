"use server";

import { adminAuth } from "@/lib/firebase/firebaseAdmin";

export async function deleteUserAccount(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    console.log(`Successfully deleted user: ${uid}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}
