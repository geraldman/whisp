'use client';

import { useRouter } from 'next/navigation';
import type { SearchedUser } from './SearchUser';

export default function AddUser({
  user,
}: {
  user: SearchedUser;
}) {
  const router = useRouter();

  return (
    /* FULL CHAT AREA */
    <div className="w-full h-full flex items-center justify-center bg-[#F6F1E3]">
      {/* CARD */}
      <div
        className="w-full max-w-[420px] rounded-2xl bg-[#EFE6D8]
                   p-8 text-center shadow-[0_12px_32px_rgba(84,51,16,0.18)]"
      >
        {/* AVATAR */}
        <div
          className="w-24 h-24 mx-auto rounded-full bg-white
                     border border-[#74512D]/25
                     flex items-center justify-center mb-4"
        >
          <span className="text-3xl font-semibold text-[#543310]">
            {user.name[0]}
          </span>
        </div>

        {/* NAME */}
        <p className="text-lg font-semibold text-[#543310]">
          {user.name}
        </p>

        {/* ID */}
        <p className="text-sm text-[#74512D] mt-1">
          ID · {user.id}
        </p>

        {/* ACTION */}
        <div className="mt-6 flex justify-center">
          {!user.isFriend ? (
            <button
              className="cursor-pointer px-6 py-2.5 rounded-xl
                         bg-white border border-[#74512D]/30
                         text-[#543310] text-sm font-medium
                         shadow-[0_6px_18px_rgba(84,51,16,0.18)]
                         hover:bg-[#F1E3CD]
                         active:scale-95
                         transition"
            >
              Add
            </button>
          ) : (
            <button
              onClick={() => router.push(`/chat/${user.id}`)}
              className="cursor-pointer px-6 py-2.5 rounded-xl
                         bg-[#74512D] text-white text-sm font-medium
                         shadow-[0_8px_20px_rgba(84,51,16,0.25)]
                         hover:bg-[#543310]
                         active:scale-95
                         transition"
            >
              Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
