"use client";

import ProfileSection from "./ProfileSection";
import SearchUser from "./SearchUser";
import ChatList from "./ChatList";
import Link from "next/link";

export default function ChatSidebar({ user, onSearchResult }: any) {
  return (
    <div style={{ 
      width: 320, 
      borderRight: "1px solid #ddd", 
      display: "flex", 
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden"
    }}>
      <div style={{ flexShrink: 0 }}>
        <ProfileSection user={user} />
        <SearchUser onSearchResult={onSearchResult} />
      </div>

      <ChatList uid={user.uid} />
    </div>
  );
}
