'use client';

import { useState } from 'react';
import { ChatProvider } from '@/lib/context/ChatContext';
import { SidebarProvider, useSidebar } from '@/lib/context/SidebarContext';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import ChatSidebar from '@/app/components/ChatSidebar';
import SettingsContent from '@/app/components/SettingsContent';
import UserProfilePanel from '@/app/components/AddUser';
import LoadingScreen from '@/app/components/LoadingScreenFixed';
import type { SearchedUser } from '@/app/components/SearchUser';

export type SidebarMode = 'chat' | 'settings';
export type SettingsView = 'profile' | 'requests' | 'about';

function ChatLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();
  const [mode, setMode] = useState<SidebarMode>('chat');
  const [settingsView, setSettingsView] =
    useState<SettingsView>('profile');
  const [searchedUser, setSearchedUser] =
    useState<SearchedUser | null>(null);
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-[#F6F1E3] relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChatSidebar
        mode={mode}
        settingsView={settingsView}
        onOpenSettings={() => setMode('settings')}
        onBackToChat={() => setMode('chat')}
        onChangeSettingsView={setSettingsView}
        onSearchUser={setSearchedUser}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-hidden w-full md:w-auto">
        {mode === 'settings' ? (
          <SettingsContent 
            view={settingsView} 
            onBack={() => setSidebarOpen(true)} 
          />
        ) : searchedUser ? (
          /* ================= SEARCH MODE (FULL) ================= */
          <div className="h-full w-full">
            <UserProfilePanel 
              user={searchedUser} 
              onBack={() => setSearchedUser(null)}
            />
          </div>
        ) : (
          /* ================= NORMAL MODE ================= */
          <div className="h-full w-full">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <SidebarProvider>
        <ChatLayoutInner>{children}</ChatLayoutInner>
      </SidebarProvider>
    </ChatProvider>
  );
}
