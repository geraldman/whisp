"use client";

import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserKeys } from "@/app/actions/auth";
import { routes } from "@/app/routes";
import { useAuth } from "@/lib/context/AuthContext";
import { getDB } from "@/lib/db/indexeddb";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { deriveKeyFromPassword } from "@/lib/crypto/keyStore";
import { aesDecrypt } from "@/lib/crypto/aes";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(routes.chats);
    }
  }, [user, router]);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      // Step 1: Authenticate with Firebase (verifies password)
      console.log("Authenticating with Firebase...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Step 2: Fetch encrypted keys from server
      console.log("Fetching encrypted keys...");
      const keysResult = await getUserKeys(uid);
      
      if (!keysResult.success) {
        setError(keysResult.error || "Failed to fetch keys");
        return;
      }
      
      // Step 3: Decrypt private key on CLIENT (password never sent to server for crypto)
      console.log("Decrypting private key on client...");
      const kdfPassword = await deriveKeyFromPassword(password, keysResult.salt);
      
      const ivArray = Array.from(Uint8Array.from(atob(keysResult.iv), c => c.charCodeAt(0)));
      const dataArray = Array.from(Uint8Array.from(atob(keysResult.encryptedPrivateKey), c => c.charCodeAt(0)));
      
      const decryptedPrivateKeyBase64 = await aesDecrypt(kdfPassword, ivArray, dataArray);
      
      // Step 4: Import as CryptoKey
      const privateKeyBuffer = Uint8Array.from(atob(decryptedPrivateKeyBase64), c => c.charCodeAt(0));
      const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
      );

      // Step 5: Store in IndexedDB (client-side only)
      console.log("Storing keys in IndexedDB...");
      const db = await getDB();
      await db.put("keys", privateKey, "userPrivateKey");
      await db.put("keys", keysResult.publicKey, "userPublicKey");
      
      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log("Login successful!");
      router.replace(routes.chats);
    } catch (err: any) {
      console.error("Login exception:", err);
      setError(err.message || "An error occurred during login");
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
