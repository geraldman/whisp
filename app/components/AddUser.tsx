'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { addFriendAndCreateChat } from '@/app/actions/friend/addFriendAndCreateChat';
import { useSidebar } from '@/lib/context/SidebarContext';
import type { SearchedUser } from './SearchUser';

export default function AddUser({
  user,
  onBack,
}: {
  user: SearchedUser;
  onBack?: () => void;
}) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { setSidebarOpen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddFriend() {
    if (!currentUser?.uid) {
      setError('You must be logged in');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await addFriendAndCreateChat(currentUser.uid, user.id);
      
      // Show success message
      setSuccess(true);
      setLoading(false);
      
      // Navigate to the chat after a brief delay
      setTimeout(() => {
        router.push(`/chat/${result.chatId}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to add friend');
      setLoading(false);
    }
  }

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      setSidebarOpen(true);
    }
  }

  return (
    /* FULL CHAT AREA */
    <div className="w-full h-full flex flex-col bg-[#F6F1E3]">
      {/* NAVBAR - Mobile & Desktop */}
      <div className="h-14 px-4 flex items-center gap-3 bg-[#F8F4E1] border-b border-[#74512D]/20">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-[#AF8F6F]/20 transition"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-[#74512D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* <h1 className="text-[#543310] font-semibold text-lg">User Profile</h1> */}
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        {/* CARD */}
        <div
          className="w-full max-w-[420px] mx-4 rounded-2xl bg-[#EFE6D8]
                     p-8 text-center shadow-[0_12px_32px_rgba(84,51,16,0.18)]"
        >
        {/* AVATAR */}
        <div
          className="w-24 h-24 mx-auto rounded-full bg-white
                     border border-[#74512D]/25
                     flex items-center justify-center mb-4"
        >
          <span className="text-3xl font-semibold text-[#543310]">
            {user.name?.[0]?.toUpperCase() || '?'}
          </span>
        </div>

        {/* NAME */}
        <p className="text-lg font-semibold text-[#543310]">
          {user.name || 'Unknown'}
        </p>

        {/* ID */}
        <p className="text-sm text-[#74512D] mt-1">
          ID · {user.id}
        </p>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-4 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ACTION */}
        <div className="mt-6 flex justify-center">
          {!user.isFriend ? (
            <button
              onClick={handleAddFriend}
              disabled={loading || success}
              className="cursor-pointer px-6 py-2.5 rounded-xl
                         bg-white border border-[#74512D]/30
                         text-[#543310] text-sm font-medium
                         shadow-[0_6px_18px_rgba(84,51,16,0.18)]
                         hover:bg-[#F1E3CD]
                         active:scale-95
                         transition
                         disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {success ? '✓ Added!' : loading ? 'Adding...' : 'Add'}
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
    </div>
  );
}
