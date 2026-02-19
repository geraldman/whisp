'use client';

import type { SettingsView } from '@/app/chat/layout';
import { useSidebar } from '@/lib/context/SidebarContext';

export default function SettingsMenu({
  active,
  onChange,
}: {
  active: SettingsView;
  onChange: (v: SettingsView) => void;
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
}: {
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
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
      <p className="text-sm font-medium text-[#543310]">
        {label}
      </p>
      <p className="text-[11px] text-[#74512D]/70 mt-0.5">
        {desc}
      </p>
    </button>
  );
}
