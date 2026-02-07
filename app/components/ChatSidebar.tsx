"use client";

import ProfileSection from "./ProfileSection";
import SearchUser from "./SearchUser";
import Link from "next/link";

export default function ChatSidebar({ user }: any) {
  return (
    <div className="w-80 border-r border-gray-300 flex flex-col p-5 gap-5">
      <ProfileSection user={user} />
      <SearchUser />
      <div className="mt-auto">
        <Link href="/logout">
          <button>Logout</button>
        </Link>
      </div>
    </div>
  );
}
