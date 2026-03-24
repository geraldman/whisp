"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useUserPresence } from "@/lib/hooks/useUserPresence";

interface ExtendedUser extends User {
  numericId?: string;
  username?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  uid: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  uid: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrates profile fields stored in Firestore (username/numericId) after Firebase Auth resolves.
  // Retries help absorb transient post-login timing issues where Firestore rejects an early read.
  const hydrateUserProfile = async (firebaseUser: User) => {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (!snap.exists()) {
          return;
        }

        const data = snap.data();
        setUser({
          ...firebaseUser,
          numericId: data.numericId,
          username: data.username,
        });
        return;
      } catch {
        if (attempt === maxAttempts) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, attempt * 250));
      }
    }
  };

  // ✅ presence hanya aktif kalau user BENAR2 ADA
  useUserPresence(user ? user.uid : null);

  useEffect(() => {
    let mounted = true;

    // Auth state drives the global identity source of truth for the client app.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      setLoading(true);

      if (firebaseUser) {
        setUser(firebaseUser as ExtendedUser);
        await hydrateUserProfile(firebaseUser);
      } else {
        setUser(null);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, uid: user?.uid || null, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}