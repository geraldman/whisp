'use client';

import { useState } from 'react';
import { ChatProvider } from '@/lib/context/ChatContext';
import ChatSidebar from '@/app/components/ChatSidebar';
import SettingsContent from '@/app/components/SettingsContent';
import UserProfilePanel from '@/app/components/AddUser';
import type { SearchedUser } from '@/app/components/SearchUser';

export type SidebarMode = 'chat' | 'settings';
export type SettingsView = 'profile' | 'requests' | 'about';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<SidebarMode>('chat');
  const [settingsView, setSettingsView] =
    useState<SettingsView>('profile');

  const [searchedUser, setSearchedUser] =
    useState<SearchedUser | null>(null);

  return (
    <ChatProvider>
      <div className="flex h-screen bg-[#F6F1E3]">
      <ChatSidebar
        mode={mode}
        settingsView={settingsView}
        onOpenSettings={() => setMode('settings')}
        onBackToChat={() => setMode('chat')}
        onChangeSettingsView={setSettingsView}
        onSearchUser={setSearchedUser}
      />

      <main className="flex-1 overflow-hidden">
        {mode === 'settings' ? (
          <SettingsContent view={settingsView} />
        ) : searchedUser ? (
          /* ================= SEARCH MODE (FULL) ================= */
          <div className="h-full w-full flex items-center justify-center">
            <UserProfilePanel user={searchedUser} />
          </div>
        ) : (
          /* ================= NORMAL MODE ================= */
          <div className="h-full w-full">
            {children}
          </div>
        )}
      </main>
    </div>
    </ChatProvider>
  );
}
