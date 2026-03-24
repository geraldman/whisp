"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatMetadata {
  username: string;
  userInitial: string;
  userId: string;
}

interface ChatContextType {
  chatMetadata: Record<string, ChatMetadata>;
  setChatMetadata: (chatId: string, metadata: ChatMetadata) => void;
  getChatMetadata: (chatId: string) => ChatMetadata | null;
}

const ChatContext = createContext<ChatContextType>({
  chatMetadata: {},
  setChatMetadata: () => {},
  getChatMetadata: () => null,
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatMetadata, setChatMetadataState] = useState<Record<string, ChatMetadata>>({});

  // Lightweight client cache: prevents repeated user lookups when rendering chat header/list.
  const setChatMetadata = (chatId: string, metadata: ChatMetadata) => {
    setChatMetadataState((prev) => ({
      ...prev,
      [chatId]: metadata,
    }));
  };

  // Returns null until metadata is discovered and injected by ChatList.
  const getChatMetadata = (chatId: string): ChatMetadata | null => {
    return chatMetadata[chatId] || null;
  };

  return (
    <ChatContext.Provider value={{ chatMetadata, setChatMetadata, getChatMetadata }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}
