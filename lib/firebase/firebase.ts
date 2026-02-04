import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Fetches user encryption keys from Firestore for login
 */
export async function getUserEncryptionKeysSimplified(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }
  
  const data = userDoc.data();
  
  return {
    publicKey: data.publicKey,
    encryptedPrivateKey: data.encryptedPrivateKey,
    salt: data.salt,
    iv: data.iv,
  };
}