"use client";

import { openDB, IDBPDatabase } from "idb";

let dbInstance: IDBPDatabase | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB("e2ee-chat-db", 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Store encrypted private keys
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }

      // Store ratchet/session state
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions");
      }

      // Store cached encrypted messages
      if (!db.objectStoreNames.contains("messages")) {
        const store = db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
        store.createIndex("chatId", "chatId", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
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