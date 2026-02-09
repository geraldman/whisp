"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { getDB } from "@/lib/db/indexeddb";
import { setUserOnline, setUserOffline } from "@/lib/firebase/presence";

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
        setLoading(false); // ← Set loading false FIRST
        
        // Set user as online in Realtime Database (don't block on this)
        setUserOnline(firebaseUser.uid)
          .then(() => console.log("AuthContext: User set to online"))
          .catch(error => console.error("AuthContext: Failed to set user online:", error));
      } else {
        // User is NOT logged in via Firebase
        console.log("AuthContext: No Firebase user, clearing IndexedDB and setting offline");
        
        // Set user as offline if we had a previous user (don't block on this)
        if (user) {
          setUserOffline(user.uid)
            .then(() => console.log("AuthContext: User set to offline"))
            .catch(error => console.error("AuthContext: Failed to set user offline:", error));
        }
        
        // Clear IndexedDB (also non-blocking)
        getDB()
          .then(async (db) => {
            await db.delete("keys", "userPrivateKey");
            await db.delete("keys", "userPublicKey");
            
            // Clear session-related cache
            const { clearSessionCache } = await import("@/lib/db/indexeddb");
            await clearSessionCache();
            console.log("AuthContext: Cleared session cache");
          })
          .catch(error => console.error("AuthContext: Failed to clear IndexedDB:", error));
        
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Only log when auth state actually changes, not every render
  // console.log("AuthContext: Rendering with user:", user?.uid || "null", "loading:", loading);

  return (
    <AuthContext.Provider value={{ user, uid: user?.uid || null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
