"use client";

import ProfileSection from "./ProfileSection";
import ChatList from "./ChatList";

export default function ChatSidebar({
  user,
  onOpenFriendRequests,
}: {
  user: any;
  onOpenFriendRequests: () => void;
}) {
  return (
    <aside
      style={{
        width: 320,
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ProfileSection
        user={user}
        onOpenFriendRequests={onOpenFriendRequests}
      />

      {/* 🔽 CHAT LIST */}
      <ChatList user={user} />
    </aside>
  );
}
