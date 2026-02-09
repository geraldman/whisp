"use client";

import { getDatabase, ref, set, onDisconnect, onValue, serverTimestamp } from "firebase/database";
import { getApp } from "firebase/app";

let realtimeDb: ReturnType<typeof getDatabase> | null = null;

// Initialize Realtime Database
export function getRealtimeDB() {
  if (!realtimeDb) {
    const app = getApp();
    realtimeDb = getDatabase(app);
  }
  return realtimeDb;
}

/**
 * Set user presence to online and setup disconnect handler
 */
export async function setUserOnline(userId: string, activeChatIds: string[] = []) {
  const db = getRealtimeDB();
  const userPresenceRef = ref(db, `presence/${userId}`);
  
  // Set user as online
  await set(userPresenceRef, {
    status: "online",
    lastSeen: serverTimestamp(),
    connectedChats: activeChatIds,
  });
  
  // Setup automatic offline on disconnect
  const disconnectRef = onDisconnect(userPresenceRef);
  await disconnectRef.set({
    status: "offline",
    lastSeen: serverTimestamp(),
    connectedChats: [],
  });
  
  return userPresenceRef;
}

/**
 * Set user presence to offline
 */
export async function setUserOffline(userId: string) {
  const db = getRealtimeDB();
  const userPresenceRef = ref(db, `presence/${userId}`);
  
  await set(userPresenceRef, {
    status: "offline",
    lastSeen: serverTimestamp(),
    connectedChats: [],
  });
}

/**
 * Update connected chats list
 */
export async function updateConnectedChats(userId: string, chatIds: string[]) {
  const db = getRealtimeDB();
  const userPresenceRef = ref(db, `presence/${userId}/connectedChats`);
  
  await set(userPresenceRef, chatIds);
}

/**
 * Listen to user presence changes
 */
export function listenToUserPresence(userId: string, callback: (status: "online" | "offline", lastSeen: any) => void) {
  const db = getRealtimeDB();
  const userPresenceRef = ref(db, `presence/${userId}`);
  
  return onValue(userPresenceRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data.status, data.lastSeen);
    } else {
      callback("offline", null);
    }
  });
}

/**
 * Check if both participants are online
 */
export async function areBothUsersOnline(userId1: string, userId2: string): Promise<boolean> {
  const db = getRealtimeDB();
  
  const user1Ref = ref(db, `presence/${userId1}/status`);
  const user2Ref = ref(db, `presence/${userId2}/status`);
  
  return new Promise((resolve) => {
    let user1Status: string | null = null;
    let user2Status: string | null = null;
    let checksComplete = 0;
    
    const checkBoth = () => {
      checksComplete++;
      if (checksComplete === 2) {
        resolve(user1Status === "online" && user2Status === "online");
      }
    };
    
    onValue(user1Ref, (snapshot) => {
      user1Status = snapshot.val();
      checkBoth();
    }, { onlyOnce: true });
    
    onValue(user2Ref, (snapshot) => {
      user2Status = snapshot.val();
      checkBoth();
    }, { onlyOnce: true });
  });
}

/**
 * Get presence status of a user
 */
export async function getUserPresenceStatus(userId: string): Promise<"online" | "offline"> {
  const db = getRealtimeDB();
  const userPresenceRef = ref(db, `presence/${userId}/status`);
  
  return new Promise((resolve) => {
    onValue(userPresenceRef, (snapshot) => {
      const status = snapshot.val();
      resolve(status === "online" ? "online" : "offline");
    }, { onlyOnce: true });
  });
}
