"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storeUserKeys } from "@/app/actions/auth";
import { deleteUserAccount } from "@/app/actions/deleteUser";
import { routes } from "@/app/routes";
import { createAccountProcedureSimplified } from "@/lib/crypto";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    // Prevent default form behavior and catch all errors
    try {
      setError("");
      setLoading(true);

      let userCredential = null;

      try {
        // Step 1: Create Firebase user
        console.log("Creating Firebase user...");
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        try {
          // Step 2: Do all crypto on CLIENT (password never sent to server for crypto)
          console.log("Generating encryption keys on client...");
          const encryptionResult = await createAccountProcedureSimplified(password);
          
          // Step 3: Store encrypted keys WHILE STILL AUTHENTICATED
          // (Firestore rules require authentication for user document creation)
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
          
          if (!result.success) {
            throw new Error(result.error || "Failed to store encryption keys");
          }

          // Step 4: SECURITY - Sign out after successful registration
          // The user will need to log in to start a new session
          console.log("Registration successful! Signing out for security...");
          try {
            await signOut(auth);
          } catch (signOutErr) {
            // Ignore ERR_BLOCKED_BY_CLIENT errors from browser extensions
            // Sign out still completes successfully
            console.warn("Sign out completed with minor errors (likely browser extension blocking):", signOutErr);
          }
          
          console.log("Registration complete!");
          router.replace(routes.login);
        } catch (innerErr: any) {
          // If crypto generation or key storage fails, clean up the Firebase user
          console.error("Registration error, cleaning up Firebase user...", innerErr);
          if (userCredential?.user) {
            try {
              // The user might still be signed in, so sign out first
              try {
                await signOut(auth);
              } catch (signOutErr) {
                // Ignore sign out errors (e.g., ERR_BLOCKED_BY_CLIENT from browser extensions)
                console.warn("Sign out error during cleanup (ignorable):", signOutErr);
              }
              // Then delete the account using server-side deletion
              await deleteUserAccount(userCredential.user.uid);
              console.log("Firebase user cleaned up successfully");
            } catch (deleteErr) {
              console.error("Failed to delete Firebase user:", deleteErr);
            }
          }
          throw innerErr; // Re-throw to be caught by outer catch
        }
      } catch (err: any) {
        console.error("Registration error:", err);
        // Display user-friendly error message
        const errorMessage = err.message || err.toString() || "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } catch (unexpectedErr: any) {
      // Catch any errors from setState or other unexpected issues
      console.error("Unexpected error in handleRegister:", unexpectedErr);
      setError("An unexpected error occurred. Please try again.");
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
