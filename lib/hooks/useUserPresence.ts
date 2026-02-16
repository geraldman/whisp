"use client";

import { useEffect } from "react";
import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { rtdb } from "@/lib/firebase/firebase";

/**
 * Tracks user online/offline presence using Firebase Realtime Database
 * Uses native onDisconnect() to automatically set offline when connection drops
 */
export function useUserPresence(uid: string | null) {
  useEffect(() => {
    if (!uid) return;

    const presenceRef = ref(rtdb, `presence/${uid}`);

    // Set user as online
    set(presenceRef, {
      online: true,
      lastSeen: serverTimestamp(),
    });

    // Automatically set offline when disconnected (tab close, internet loss, etc.)
    onDisconnect(presenceRef).set({
      online: false,
      lastSeen: serverTimestamp(),
    });

    return () => {
      // Set offline when component unmounts (logout, navigation away)
      set(presenceRef, {
        online: false,
        lastSeen: serverTimestamp(),
      });
    };
  }, [uid]);
}
