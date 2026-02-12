"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

interface AuthContextType {
  user: User | null;
  uid: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  uid: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Step 1: Check IndexedDB first for faster initial auth state
    async function checkIndexedDB() {
      try {
        const { getDB } = await import("@/lib/db/indexeddb");
        const db = await getDB();
        const hasKeys = await db.get("keys", "userPrivateKey");
        
        if (hasKeys && isMounted) {
          console.log("AuthContext: Found keys in IndexedDB, user likely logged in");
          // Don't set loading to false yet, wait for Firebase confirmation
        }
      } catch (error) {
        console.error("AuthContext: Failed to check IndexedDB:", error);
      }
    }

    checkIndexedDB();

    // Step 2: Set up Firebase auth listener (source of truth)
    console.log("AuthContext: Setting up auth listener");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthContext: Auth state changed, user:", firebaseUser?.uid || "null");
      
      if (!isMounted) return;

      if (firebaseUser) {
        // User is logged in via Firebase
        setUser(firebaseUser);
        setLoading(false);
      } else {
        // User is NOT logged in via Firebase - completely delete IndexedDB
        console.log("AuthContext: No Firebase user, deleting IndexedDB");
        try {
          const { deleteDB } = await import("@/lib/db/indexeddb");
          await deleteDB();
        } catch (error) {
          console.error("AuthContext: Failed to delete IndexedDB:", error);
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  console.log("AuthContext: Rendering with user:", user?.uid || "null", "loading:", loading);

  return (
    <AuthContext.Provider value={{ user, uid: user?.uid || null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
