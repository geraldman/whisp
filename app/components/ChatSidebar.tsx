'use client';

import { useState, useRef, useEffect } from 'react';
import { CHAT_MOCKS, type ChatMock } from '@/lib/mocks/chat';
import SettingsMenu from '@/app/components/SettingsMenu';
import type {
  SidebarMode,
  SettingsView,
} from '@/app/chat/layout';

export default function ChatSidebar({
  mode,
  settingsView,
  onOpenSettings,
  onBackToChat,
  onChangeSettingsView,
}: {
  mode: SidebarMode;
  settingsView: SettingsView;
  onOpenSettings: () => void;
  onBackToChat: () => void;
  onChangeSettingsView: (v: SettingsView) => void;
}) {
  const MIN_WIDTH = 280;
  const MAX_WIDTH = 360;

  const [width, setWidth] = useState(280);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  /* ================= RESIZE ================= */
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current || !sidebarRef.current) return;

      const rect = sidebarRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;

      setWidth(
        Math.min(
          Math.max(newWidth, MIN_WIDTH),
          MAX_WIDTH
        )
      );
    }

    function onMouseUp() {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function startResize() {
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }

  return (
    <aside
      ref={sidebarRef}
      style={{ width }}
      className="relative flex flex-col h-full bg-[#F8F4E1] border-r border-[#74512D]/20"
    >
      {/* ================= HEADER ================= */}
      <div className="h-14 px-4 flex items-center gap-4 border-b border-[#74512D]/15">
        <img
          src="/logo.png"
          alt="WHISP"
          className="h-6 object-contain shrink-0"
        />

        <div className="ml-auto flex items-center gap-1 pr-2 shrink-0">
          <IconButton label="Messages" onClick={onBackToChat}>
            <MessageIcon />
          </IconButton>

          <IconButton label="Settings" onClick={onOpenSettings}>
            <SettingsIcon />
          </IconButton>

          <IconButton label="Logout">
            <LogoutIcon />
          </IconButton>
        </div>
      </div>

      {/* ================= BODY ================= */}
      {mode === 'chat' ? (
        <>
          {/* PROFILE */}
          <div className="mx-3 mt-4 mb-5 rounded-xl bg-[#EFE6D8] px-4 py-4 border border-[#74512D]/15 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white border border-[#74512D]/25 flex items-center justify-center">
                <span className="text-lg font-semibold text-[#543310]">G</span>
              </div>

              <p className="text-sm font-semibold text-[#543310]">
                Gerald Manurung
              </p>

              <div className="flex items-center gap-1">
                <span className="px-3 py-1 rounded-full text-[11px] bg-white border border-[#74512D]/20 text-[#74512D]">
                  ID · 567890
                </span>
                <CopyButton content="567890" />
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className="px-4 mb-3">
            <h2 className="text-lg font-semibold text-[#543310]">
              Messages
            </h2>
          </div>

          {/* SEARCH */}
          <div className="px-3 mb-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#74512D]/15 shadow-sm">
              <input
                placeholder="Search user by ID"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#8A7F73] text-[#543310]"
              />
              <SearchIcon />
            </div>
          </div>

          {/* CHAT LIST */}
          <div className="flex-1 overflow-y-auto chat-scroll px-2 pb-4">
            {CHAT_MOCKS.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                onClick={() => setActiveChatId(chat.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <SettingsMenu
          active={settingsView}
          onChange={onChangeSettingsView}
        />
      )}

      {/* ================= RESIZE HANDLE ================= */}
      <div
        onMouseDown={startResize}
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize
                   bg-transparent hover:bg-black/10"
      />
    </aside>
  );
}

/* ================= COPY BUTTON ================= */
function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-7 h-7 flex items-center justify-center rounded-md
                 bg-[#F1E3CD] border border-[#74512D]/15
                 text-[#74512D] text-xs
                 shadow-[0_4px_12px_rgba(84,51,16,0.18)]
                 transition-all hover:shadow-[0_6px_16px_rgba(84,51,16,0.25)]
                 active:scale-90"
    >
      {copied ? '✓' : '⧉'}
    </button>
  );
}

/* ================= CHAT ITEM ================= */
function ChatItem({
  chat,
  active,
  onClick,
}: {
  chat: ChatMock;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`mx-1 mb-2 rounded-xl px-3 py-3 flex items-center gap-3 cursor-pointer
        border border-[#74512D]/15 transition-all
        ${
          active
            ? 'bg-[#E6D5BC] shadow-[0_8px_22px_rgba(84,51,16,0.22)]'
            : 'bg-white hover:bg-[#F1E3CD] shadow-[0_4px_14px_rgba(84,51,16,0.14)]'
        }`}
    >
      <div className="w-9 h-9 rounded-full bg-white border border-[#74512D]/25 flex items-center justify-center">
        <span className="text-xs font-medium text-[#543310]">
          {chat.name[0]}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#543310] truncate">
          {chat.name}
        </p>
        <p className="text-xs text-[#74512D] truncate">
          {chat.lastMessage}
        </p>
      </div>
    </div>
  );
}

/* ================= ICON BUTTON ================= */
function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center
                   text-[#74512D] hover:bg-[#AF8F6F]/30 transition"
        aria-label={label}
      >
        {children}
      </button>

      <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2
                       rounded-md bg-[#543310] px-2 py-0.5 text-[10px] text-white
                       opacity-0 group-hover:opacity-100 transition">
        {label}
      </span>
    </div>
  );
}

/* ================= ICONS ================= */
function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-[#8A7F73]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7M5 21l2-2h11a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
    </svg>
  );
}
