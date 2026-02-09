"use client";

import { openDB, IDBPDatabase } from "idb";

let dbInstance: IDBPDatabase | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB("e2ee-chat-db", 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`IndexedDB: Upgrading from version ${oldVersion} to ${newVersion}`);
      
      // Store encrypted private keys
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
        console.log("IndexedDB: Created 'keys' store");
      }

      // Store ratchet/session state (USED FOR FUTURE DEVELOPMENT)
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions");
        console.log("IndexedDB: Created 'sessions' store");
      }

      // Store cached encrypted messages
      if (!db.objectStoreNames.contains("messages")) {
        const store = db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
        store.createIndex("chatId", "chatId", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
        console.log("IndexedDB: Created 'messages' store");
      }

      // Store cached user data (public keys, salt) to reduce Firebase calls
      if (!db.objectStoreNames.contains("userCache")) {
        db.createObjectStore("userCache"); // key: userId, value: {publicKey, salt, cachedAt}
        console.log("IndexedDB: Created 'userCache' store");
      }

      // Store active session info per chat
      if (!db.objectStoreNames.contains("activeSessions")) {
        db.createObjectStore("activeSessions"); // key: chatId, value: {sessionId, encryptedKey, cachedAt}
        console.log("IndexedDB: Created 'activeSessions' store");
      }
    },
    blocked() {
      console.warn("IndexedDB blocked - close other tabs");
    },
    blocking() {
      console.warn("IndexedDB blocking - database upgrade needed");
    },
    terminated() {
      console.error("IndexedDB terminated unexpectedly");
      dbInstance = null;
    },
  });
  
  return dbInstance;
}

// ============ CACHE MANAGEMENT ============

/**
 * Cache user public key and salt in IndexedDB
 */
export async function cacheUserData(userId: string, publicKey: string, salt?: string) {
  const db = await getDB();
  await db.put("userCache", {
    publicKey,
    salt,
    cachedAt: Date.now()
  }, userId);
}

/**
 * Get cached user data (public key, salt)
 */
export async function getCachedUserData(userId: string): Promise<{
  publicKey: string;
  salt?: string;
  cachedAt: number;
} | null> {
  const db = await getDB();
  return await db.get("userCache", userId);
}

/**
 * Cache active session for a chat
 */
export async function cacheActiveSession(
  chatId: string, 
  sessionId: string, 
  encryptedKey: string
) {
  const db = await getDB();
  await db.put("activeSessions", {
    sessionId,
    encryptedKey,
    cachedAt: Date.now()
  }, chatId);
}

/**
 * Get cached active session
 */
export async function getCachedActiveSession(chatId: string): Promise<{
  sessionId: string;
  encryptedKey: string;
  cachedAt: number;
} | null> {
  const db = await getDB();
  return await db.get("activeSessions", chatId);
}

/**
 * Clear session-related cache when user logs out
 */
export async function clearSessionCache() {
  try {
    const db = await getDB();
    
    // Check which stores exist before creating transaction
    const storeNames: string[] = [];
    if (db.objectStoreNames.contains("activeSessions")) {
      storeNames.push("activeSessions");
    }
    if (db.objectStoreNames.contains("sessions")) {
      storeNames.push("sessions");
    }
    
    // Only create transaction if stores exist
    if (storeNames.length === 0) {
      console.log("clearSessionCache: No session stores to clear");
      return;
    }
    
    const tx = db.transaction(storeNames, "readwrite");
    for (const storeName of storeNames) {
      await tx.objectStore(storeName).clear();
    }
    await tx.done;
    console.log("clearSessionCache: Cleared stores:", storeNames);
  } catch (error) {
    console.error("clearSessionCache: Error clearing cache:", error);
  }
}

/**
 * Clear all cached user data (for complete logout)
 */
export async function clearAllCache() {
  try {
    const db = await getDB();
    const storesToClear = ["userCache", "activeSessions", "sessions", "messages"];
    
    for (const storeName of storesToClear) {
      if (db.objectStoreNames.contains(storeName)) {
        await db.clear(storeName);
        console.log(`clearAllCache: Cleared ${storeName}`);
      }
    }
  } catch (error) {
    console.error("clearAllCache: Error clearing cache:", error);
  }
}