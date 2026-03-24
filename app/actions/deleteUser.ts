"use server";

import { deleteChatfromUserDeletion } from "@/app/actions/deleteChatDocument";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";

export async function deleteUserAccount(uid: string) {
  try {
    const didDeleteChats = await deleteChatfromUserDeletion(uid);
    if (!didDeleteChats) {
      throw new Error("Failed to delete chats for user");
    }

    const incomingRequests = await adminDb
      .collection("friend_requests")
      .where("to", "==", uid)
      .get();

    const outgoingRequests = await adminDb
      .collection("friend_requests")
      .where("from", "==", uid)
      .get();

    const batch = adminDb.batch();

    incomingRequests.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    outgoingRequests.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(adminDb.collection("users").doc(uid));
    await batch.commit();

    await adminAuth.deleteUser(uid);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
