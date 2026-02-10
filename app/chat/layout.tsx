'use client';

import { useState } from 'react';
import ChatSidebar from '@/app/components/ChatSidebar';
import SettingsContent from '@/app/components/SettingsContent';

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

  return (
    <div className="flex h-screen bg-[#F6F1E3]">
      <ChatSidebar
        mode={mode}
        settingsView={settingsView}
        onOpenSettings={() => setMode('settings')}
        onBackToChat={() => setMode('chat')}
        onChangeSettingsView={setSettingsView}
      />

      <main className="flex-1 overflow-hidden">
        {mode === 'settings' ? (
          <SettingsContent view={settingsView} />
        ) : (
          children
        )}
      </main>
    </div>
  );
}
