'use client';

import type { SettingsView } from '@/app/chat/layout';
import { useSidebar } from '@/lib/context/SidebarContext';

export default function SettingsMenu({
  active,
  onChange,
  requestCount = 0,
}: {
  active: SettingsView | null;
  onChange: (v: SettingsView) => void;
  requestCount?: number;
}) {
  const { setSidebarOpen } = useSidebar();

  const handleClick = (view: SettingsView) => {
    onChange(view);
    setSidebarOpen(false);
  };

  return (
    <div className="px-4 py-5 flex flex-col gap-3">
      {/* Title */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-[#543310]">
          Settings
        </h2>
        <p className="text-xs text-[#74512D]/70 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Item
        label="Profile"
        desc="Personal information & identity"
        active={active === 'profile'}
        onClick={() => handleClick('profile')}
      />

      <Item
        label="Friend Requests"
        desc="Manage incoming connections"
        active={active === 'requests'}
        onClick={() => handleClick('requests')}
        badge={requestCount}
      />

      <Item
        label="About"
        desc="App info & security details"
        active={active === 'about'}
        onClick={() => handleClick('about')}
      />
    </div>
  );
}

function Item({
  label,
  desc,
  active,
  onClick,
  badge,
}: {
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        cursor-pointer text-left px-3 py-3 rounded-xl transition
        ${
          active
            ? 'bg-[#E6D5BC]'
            : 'hover:bg-[#F1E3CD]'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#543310]">
          {label}
        </p>
        {badge !== undefined && badge > 0 && (
          <span className="w-2 h-2 rounded-full bg-red-500" />
        )}
      </div>
      <p className="text-[11px] text-[#74512D]/70 mt-0.5">
        {desc}
      </p>
    </button>
  );
}
