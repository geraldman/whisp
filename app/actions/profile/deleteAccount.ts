"use client";

import { auth, db } from "@/lib/firebase/firebase";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { getDB } from "@/lib/db/indexeddb";

export async function deleteAccount() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not authenticated");
  }

  const userId = user.uid;

  try {
    // Delete user data from Firestore first
    await deleteDoc(doc(db, "users", userId));

    // Delete all user's chats (optional, tergantung struktur data)
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId)
    );
    const userChats = await getDocs(chatsQuery);

    const batch = writeBatch(db);
    userChats.docs.forEach((chatDoc) => {
      batch.delete(chatDoc.ref);
    });
    await batch.commit();

    // Clear IndexedDB
    try {
      const indexedDb = await getDB();
      await indexedDb.delete("keys", "userPrivateKey");
      await indexedDb.delete("keys", "userPublicKey");
    } catch (error) {
      console.error("Failed to clear IndexedDB:", error);
    }

    // Delete user from Firebase Auth (must be last)
    await deleteUser(user);

    return { success: true };
  } catch (error: any) {
    console.error("Delete account error:", error);
    
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Untuk keamanan, silakan logout dan login kembali sebelum menghapus akun.");
    }
    
    throw new Error("Gagal menghapus akun. Silakan coba lagi.");
  }
}
