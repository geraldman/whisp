"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

interface UnlinkResult {
  success: boolean;
  error?: string;
}

export async function unlinkChatFromFriendRequest(
  chatId: string,
  userId: string
): Promise<UnlinkResult> {
  try {
    console.log(`🔗 Unlinking chatId ${chatId} from friend_requests for user ${userId}`);

    // Find all friend_requests that reference this chatId
    const friendRequestsRef = adminDb.collection("friend_requests");
    
    // Query where user is either sender or receiver and chatId matches
    const fromQuery = friendRequestsRef
      .where("from", "==", userId)
      .where("chatId", "==", chatId)
      .get();
    
    const toQuery = friendRequestsRef
      .where("to", "==", userId)
      .where("chatId", "==", chatId)
      .get();

    const [fromSnapshot, toSnapshot] = await Promise.all([fromQuery, toQuery]);

    // Update all matching documents to remove chatId
    const batch = adminDb.batch();
    let updateCount = 0;

    fromSnapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      batch.update(doc.ref, { chatId: FieldValue.delete() });
      updateCount++;
    });

    toSnapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      batch.update(doc.ref, { chatId: FieldValue.delete() });
      updateCount++;
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Unlinked chatId from ${updateCount} friend_request(s)`);
    } else {
      console.log(`ℹ️ No friend_requests found with chatId ${chatId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error unlinking chat from friend request:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
