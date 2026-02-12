"use client";

import { openDB, IDBPDatabase, deleteDB as idbDeleteDB } from "idb";

let dbInstance: IDBPDatabase | null = null;
const DB_NAME = "e2ee-chat-db";
const DB_VERSION = 2;

export async function getDB() {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
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

/**
 * Completely deletes the IndexedDB database and resets the instance.
 * This should be called when the user logs out or is not authenticated.
 */

export async function deleteDB() {
  try {
    // Close the current connection if it exists
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
    }
    
    // Delete the entire database
    await idbDeleteDB(DB_NAME);
    console.log("IndexedDB: Database deleted successfully");
  } catch (error) {
    console.error("IndexedDB: Failed to delete database", error);
    throw error;
  }
}