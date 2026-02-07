"use client";

import ProfileSection from "./ProfileSection";
import SearchUser from "./SearchUser";

export default function ChatSidebar({ user }: any) {
  return (
    <aside
      style={{
        width: 320,
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ProfileSection user={user} />
      <SearchUser />
    </aside>
  );
}
