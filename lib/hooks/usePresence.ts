"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  setUserOnline, 
  setUserOffline, 
  listenToUserPresence,
  getUserPresenceStatus 
} from "@/lib/firebase/presence";

export function usePresence() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsOnline(false);
      return;
    }

    // Set user online when component mounts
    setUserOnline(user.uid).catch(console.error);
    setIsOnline(true);

    // Cleanup: set offline when component unmounts
    return () => {
      setUserOffline(user.uid).catch(console.error);
    };
  }, [user]);

  return { isOnline };
}

/**
 * Hook to listen to another user's presence status
 */
export function useUserPresence(userId: string | null) {
  const [status, setStatus] = useState<"online" | "offline">("offline");
  const [lastSeen, setLastSeen] = useState<any>(null);

  useEffect(() => {
    if (!userId) {
      setStatus("offline");
      return;
    }

    const unsubscribe = listenToUserPresence(userId, (newStatus, newLastSeen) => {
      setStatus(newStatus);
      setLastSeen(newLastSeen);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  return { status, lastSeen };
}
