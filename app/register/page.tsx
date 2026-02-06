"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storeUserKeys } from "@/app/actions/auth";
import { routes } from "@/app/routes";
import { createAccountProcedureSimplified } from "@/lib/crypto";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    setLoading(true);

    try {
      // Step 1: Create Firebase user
      console.log("Creating Firebase user...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Step 2: Do all crypto on CLIENT (password never sent to server for crypto)
      console.log("Generating encryption keys on client...");
      const encryptionResult = await createAccountProcedureSimplified(password);
      
      // Step 3: Send only encrypted keys to server for storage
      console.log("Storing encrypted keys...");
      const result = await storeUserKeys(
        uid,
        email,
        username,
        encryptionResult.publicKey,
        encryptionResult.encryptedPrivateKey,
        encryptionResult.iv,
        encryptionResult.salt
      );
      
      if (result.success) {
        console.log("Registration successful!");
        router.replace(routes.login);
      } else {
        setError("Registration Failed: "+ result.error || "Registration failed");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Register</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <br />
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}