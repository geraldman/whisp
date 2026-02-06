"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { routes } from "@/app/routes";
import { useAuth } from "@/lib/context/AuthContext";
import { loginAccountProcedureSimplified } from "@/lib/crypto";
import { getDB } from "@/lib/db/indexeddb";
import { auth, getUserEncryptionKeysSimplified } from "@/lib/firebase/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log("User already logged in, redirecting...");
      // TODO: Replace 'default' with actual chatId from user's chat list
      router.replace(routes.chat('chats'));
    }
  }, [user, authLoading, router]);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      console.log("Starting login process...");
      
      // Sign in directly on client-side for proper persistence
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log("Firebase auth successful, uid:", uid);
      
      // Fetch encryption keys
      const keys = await getUserEncryptionKeysSimplified(uid);
      console.log("Fetched encryption keys");
      
      // Decrypt private key
      console.log("Decrypting private key...");
      const login = await loginAccountProcedureSimplified(
        password, 
        keys.encryptedPrivateKey, 
        keys.iv,
        keys.salt
      );
      console.log("Private key decrypted successfully");
      
      // Save to IndexedDB
      const db = await getDB();
      await db.put("keys", login.privateKey, "userPrivateKey");
      console.log("Private key saved to IndexedDB");
      
      // Auth state will update automatically, which will trigger redirect in useEffect
      console.log("Login complete, waiting for auth state update...");
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Email or password is incorrect");
    } finally {
      setLoading(false);
    }
  }

  // Show loading while checking auth state
  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Login</h1>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "login"}
      </button>
    </div>
  );
}
