'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    if (loading || success) return;

    if (!currentUser?.uid) {
      setError('You must be logged in');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await addFriendAndCreateChat(
        currentUser.uid,
        user.id
      );

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        router.push(`/chat/${result.chatId}`);
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to add friend');
      setLoading(false);
    }
  }

  function handleBack() {
    if (onBack) onBack();
    else setSidebarOpen(true);
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#F6F1E3] overflow-x-hidden">
      {/* NAVBAR */}
      <div className="hidden md:flex h-14 px-4 items-center gap-3 bg-[#F8F4E1] border-b border-[#74512D]/20 sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="hidden md:flex cursor-pointer p-2 rounded-lg
                    hover:bg-[#AF8F6F]/20 active:scale-95 transition"
          aria-label="Back"
        >
          <svg
            className="w-5 h-5 text-[#74512D]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* CONTENT */}
      <div className="
        flex-1
        px-4
        pb-36
        flex flex-col items-center justify-center
        min-h-[calc(100dvh-56px)]
        md:min-h-0 md:pb-8
        relative
      ">

        {/* ✨ radial glow */}
          <div className="
            pointer-events-none
            absolute
            w-[420px] h-[420px]
            rounded-full
            bg-[radial-gradient(circle_at_center,rgba(175,143,111,0.24),transparent_65%)]
            blur-2xl
            "
          />

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-[420px] rounded-2xl bg-[#EFE6D8]
                     p-6 sm:p-8 text-center
                     shadow-[0_20px_50px_rgba(84,51,16,0.18)]"
        >
          {/* CLOSE (mobile only) */}
        <button
          onClick={handleBack}
          aria-label="Close"
          className="
            cursor-pointer md:hidden
            absolute top-3 right-3
            w-9 h-9 rounded-full
            flex items-center justify-center
            bg-white/80 backdrop-blur
            border border-[#74512D]/15
            text-[#74512D]
            shadow-sm
            hover:bg-white
            active:scale-95
            transition
            "
          >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6l12 12M18 6l-12 12"
            />
          </svg>
        </button>

          {/* AVATAR */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full p-[2px]
                          bg-gradient-to-br from-[#AF8F6F] to-[#5C3A21] mb-4">
            <div className="w-full h-full rounded-full bg-white
                            border border-[#74512D]/10
                            flex items-center justify-center
                            shadow-inner">
              <span className="text-3xl font-semibold text-[#543310]">
                {user.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          </div>

          {/* NAME */}
          <p className="text-lg font-semibold text-[#543310]">
            {user.name || 'Unknown'}
          </p>

          {/* ID */}
          <p className="text-sm text-[#74512D] mt-1">
            ID · {user.id}
          </p>

          {/* ERROR */}
          {error && (
            <div className="mt-4 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* ACTION */}
          <div className="mt-7 flex justify-center">
            {!user.isFriend ? (
              <button
                onClick={handleAddFriend}
                disabled={loading || success}
                className="
                  cursor-pointer
                  min-w-[140px]
                  px-6 py-2.5 rounded-xl
                  text-sm font-medium
                  text-white
                  bg-gradient-to-br from-[#6B4A2E] to-[#5C3A21]
                  shadow-[0_10px_24px_rgba(84,51,16,0.28)]
                  hover:brightness-110
                  active:scale-[0.96]
                  transition
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : success ? (
                  '✓ Added!'
                ) : (
                  'Add Friend'
                )}
              </button>
            ) : (
              <button
                onClick={() => router.push(`/chat/${user.id}`)}
                className="
                  cursor-pointer
                  px-6 py-2.5 rounded-xl
                  text-sm font-medium text-white
                  bg-[#74512D]
                  shadow-[0_10px_24px_rgba(84,51,16,0.25)]
                  hover:bg-[#543310]
                  active:scale-[0.96]
                  transition
                "
              >
                Open Chat
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}