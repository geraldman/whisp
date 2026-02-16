"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { storeUserKeys } from "@/app/actions/auth";
import { deleteUserAccount } from "@/app/actions/deleteUser";
import { routes } from "@/app/routes";
import { createAccountProcedureSimplified } from "@/lib/crypto";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import LoadingScreen from "@/app/components/LoadingScreen";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleRegister() {
    // Prevent default form behavior and catch all errors
    try {
      setError("");
      setLoading(true);

      let userCredential = null;

      if (!username.trim()) {
        setError("Username is required");
        setLoading(false);
        return;
      }

      if (username.trim().length < 3) {
        setError("Username must be at least 3 characters");
        setLoading(false);
        return;
      }

      if (!email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }

      if (!isValidEmail(email.trim())) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      if (!password) {
        setError("Password is required");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }


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
    <>
      {/* SUCCESS LOADING */}
      {loading && <LoadingScreen />}

      {!loading && (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F4E1] px-4 relative overflow-hidden">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-4 left-4 sm:top-6 sm:left-8 lg:left-20 z-30"
          >
            <Image
              src="/logo.png"
              alt="WHISP Logo"
              width={160}
              height={60}
              className="object-contain w-32 sm:w-36 lg:w-40 h-auto"
              priority
            />
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg"
          >
            {/* Back */}
            <button
              onClick={() => router.push(routes.home)}
              className="cursor-pointer mb-4 w-9 h-9 rounded-full
                         flex items-center justify-center
                         bg-[#74512D]/10 text-[#74512D]
                         hover:bg-[#74512D]/20 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-semibold text-[#5C3A21] mb-1 text-center"
            >
              Create your Whisp account
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[13px] text-black/70 text-center mb-8"
            >
              Sign up to start secure conversations.
            </motion.p>

            {/* Auth Switch */}
            <div className="mb-6">
              <div className="relative flex bg-[#74512D]/10 rounded-full p-1">
                <div className="absolute top-1 right-1 h-[calc(100%-0.5rem)] w-1/2 bg-white rounded-full shadow transition-all duration-300" />

                <button
                  onClick={() => router.push(routes.login)}
                  className="cursor-pointer relative z-10 w-1/2 py-2 text-sm font-medium
                             text-[#5C3A21]/60 hover:text-[#5C3A21]"
                >
                  Login
                </button>

                <button className="cursor-pointer relative z-10 w-1/2 py-2 text-sm font-medium text-[#5C3A21]">
                  Register
                </button>
              </div>
            </div>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm text-[#5C3A21] mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="whisp_user"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm
                           border border-[#74512D]/20
                           focus:ring-2 focus:ring-[#74512D]/40 outline-none"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm text-[#5C3A21] mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="whisp@example.com"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm
                           border border-[#74512D]/20
                           focus:ring-2 focus:ring-[#74512D]/40 outline-none"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-sm text-[#5C3A21] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white px-4 py-3 pr-12 text-sm
                             border border-[#74512D]/20
                             focus:ring-2 focus:ring-[#74512D]/40 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[#74512D]/60 hover:text-[#74512D]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2"
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                    <circle cx="12" cy="12" r="3" />
                    {!showPassword && (
                      <line x1="3" y1="3" x2="21" y2="21" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              className="cursor-pointer mt-6 w-full rounded-xl bg-[#74512D] py-3
                         text-white font-medium
                         shadow-md shadow-[#74512D]/30
                         hover:-translate-y-0.5 hover:shadow-lg
                         transition-all"
            >
              Register
            </button>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-6 w-full text-center"
          >
            <p className="text-xs text-black/40 hover:text-black/70 transition">
              © 2026 WHISP • All rights reserved.
            </p>
          </motion.footer>
        </div>
      )}
    </>
  );
}

