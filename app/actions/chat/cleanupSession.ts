"use client";

import { 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc 
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { expireSession } from "./sessionManager";
import { getUserPresenceStatus } from "@/lib/firebase/presence";

/**
 * Check if both users in a chat are offline, and clean up if so
 */
export async function checkAndCleanupSession(chatId: string): Promise<void> {
  try {
    // Get chat participants
    const chatDoc = await getDocs(
      query(collection(db, "chats"), where("__name__", "==", chatId))
    );
    
    if (chatDoc.empty) {
      console.log("Chat not found");
      return;
    }
    
    const chatData = chatDoc.docs[0].data();
    const participants = chatData.participants as string[];
    
    if (participants.length !== 2) {
      console.log("Invalid participants count");
      return;
    }
    
    // Check if both users are offline
    const [user1Status, user2Status] = await Promise.all([
      getUserPresenceStatus(participants[0]),
      getUserPresenceStatus(participants[1]),
    ]);
    
    const bothOffline = user1Status === "offline" && user2Status === "offline";
    
    if (bothOffline) {
      console.log("Both users offline, cleaning up session...");
      
      // Get current session ID
      const currentSessionId = chatData.currentSessionId;
      
      if (currentSessionId) {
        // Mark session as expired
        await expireSession(chatId, currentSessionId);
        
        // Delete all messages from this session
        const messagesQuery = query(
          collection(db, "chats", chatId, "messages"),
          where("sessionId", "==", currentSessionId)
        );
        
        const messagesSnapshot = await getDocs(messagesQuery);
        
        const deletePromises = messagesSnapshot.docs.map(messageDoc =>
          deleteDoc(doc(db, "chats", chatId, "messages", messageDoc.id))
        );
        
        await Promise.all(deletePromises);
        
        console.log(`Deleted ${messagesSnapshot.size} messages from expired session`);
      }
    } else {
      console.log("At least one user is still online, keeping session");
    }
  } catch (error) {
    console.error("Error in cleanup:", error);
  }
}

/**
 * Listen to presence changes and trigger cleanup when both users go offline
 */
export function setupPresenceCleanupListener(
  chatId: string,
  participant1Id: string,
  participant2Id: string
) {
  const { listenToUserPresence } = require("@/lib/firebase/presence");
  
  let user1Offline = false;
  let user2Offline = false;
  
  const checkBothOffline = () => {
    if (user1Offline && user2Offline) {
      console.log("Both users went offline, triggering cleanup...");
      checkAndCleanupSession(chatId);
    }
  };
  
  const unsubscribe1 = listenToUserPresence(participant1Id, (status: string) => {
    user1Offline = status === "offline";
    checkBothOffline();
  });
  
  const unsubscribe2 = listenToUserPresence(participant2Id, (status: string) => {
    user2Offline = status === "offline";
    checkBothOffline();
  });
  
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}
