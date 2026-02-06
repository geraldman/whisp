"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db, getUserEncryptionKeys, getUserEncryptionKeysSimplified } from "@/lib/firebase/firebase";
import { createAccountProcedure } from "@/lib/cryptoAdvanced";
import { createAccountProcedureSimplified, generateRSAKeyPair, loginAccountProcedureSimplified } from "@/lib/crypto";
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


export async function loginUserSimplified(
  email: string,
  password: string,
) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password); // if passed, then the password is correct
    const uid = userCredential.user.uid;
    
    // Fetch encryption keys from Firestore
    const keys = await getUserEncryptionKeysSimplified(uid);

    const login = loginAccountProcedureSimplified(
      password, 
      keys.encryptedPrivateKey, 
      keys.iv,
      keys.salt
    );

    /* LocalStorage or IndexedDB to keep all data */
    const db = await getDB();
    await db.put("keys", login.privateKey, "userPrivateKey");
    
    return { 
      success: true, 
      uid,
    };
  } catch (error: any) {
    return { success: false, error: "Email or password is incorrect" };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: "Email or password is incorrect" };
  }
}
