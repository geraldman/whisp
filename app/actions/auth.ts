"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, writeBatch, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/firebase";
import { generateUniqueNumericId } from "@/lib/generateUserId";

// Server action to store encrypted keys (crypto already done on client)
export async function storeUserKeys(
  uid: string,
  email: string,
  username: string,
  publicKey: string,
  encryptedPrivateKey: string,
  iv: string,
  salt: string
) {
  try {
    const batch = writeBatch(db);
    const numericId = await generateUniqueNumericId();

    batch.set(doc(db, "users", uid), {
      uid,
      email,
      username,
      username_lower: username.toLowerCase(),
      createdAt: serverTimestamp(),
      publicKey,
      encryptedPrivateKey,
      iv,
      salt,
      numericId,
    });

    batch.set(doc(db, "user_numeric_index", numericId), {
      uid,
      createdAt: serverTimestamp(),
    });

    await batch.commit();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Server action to fetch encrypted keys
export async function getUserKeys(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const data = userDoc.data();
    return {
      success: true,
      publicKey: data.publicKey,
      encryptedPrivateKey: data.encryptedPrivateKey,
      iv: data.iv,
      salt: data.salt,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}





