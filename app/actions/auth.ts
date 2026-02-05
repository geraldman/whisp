"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db, getUserEncryptionKeysSimplified } from "@/lib/firebase/firebase";
import { createAccountProcedure } from "@/lib/cryptoAdvanced";
import { createAccountProcedureSimplified, generateRSAKeyPair, loginAccountProcedureSimplified } from "@/lib/crypto";
import { generateUniqueNumericId } from "@/lib/generateUserId";


export async function registerUserSimplified(
  email: string,
  password: string,
  username: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const encryptionResult = await createAccountProcedureSimplified(password);
    const user = userCredential.user;
    const batch = writeBatch(db);
    const numericId = await generateUniqueNumericId();

    // Save user profile to Firestore 
    batch.set(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      username,
      username_lower: username.toLowerCase(),
      createdAt: serverTimestamp(),
      publicKey: encryptionResult.publicKey,
      encryptedPrivateKey: encryptionResult.encryptedPrivateKey,
      iv: encryptionResult.iv,
      salt: encryptionResult.salt,
      numericId,
    });

    batch.set(doc(db, "user_numeric_index", numericId), {
      uid: user.uid,
      createdAt: serverTimestamp(),
      });

      await batch.commit();

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function registerUser(
  email: string,
  password: string,
  username: string
) {
  try {
    // Create account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const encryptProcedure = createAccountProcedure(password);// take the password to PBKDF2, salt = ??

    const user = userCredential.user;

    // Save user profile to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      username,
      username_lower: username.toLowerCase(),
      createdAt: serverTimestamp(),
      identityPublicKey: (await encryptProcedure).publicKey,
      encryptedPrivateKey: (await encryptProcedure).encryptedPrivateKey,
      keyEncryptionSalt: (await encryptProcedure).salt,
      keyEncryptionNonce: (await encryptProcedure).nonce,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function loginUserSimplified(
  email: string,
  password: string,
) {
  try {
    console.log("Starting login...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    console.log("Firebase auth successful, uid:", uid);
    
    // Fetch encryption keys from Firestore
    const keys = await getUserEncryptionKeysSimplified(uid);
    console.log("Fetched encryption keys from Firestore");
    
    return { 
      success: true, 
      uid,
      encryptionKeys: keys,
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message || "Email or password is incorrect" };
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


