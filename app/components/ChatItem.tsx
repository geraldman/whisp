"use client";

interface ChatItemProps {
  username: string;
  chatExpired: boolean;
  isOnline: boolean;
  active: boolean;
  onClick: () => void;
}

export default function ChatItem({
  username,
  chatExpired,
  isOnline,
  active,
  onClick,
}: ChatItemProps) {
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
      {/* Avatar with status indicator */}
      <div className="relative">
        <div className="w-9 h-9 rounded-full bg-white border border-[#74512D]/25 flex items-center justify-center">
          <span className="text-xs font-medium text-[#543310]">
            {username[0]?.toUpperCase() || '?'}
          </span>
        </div>
        {/* Status dot */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#543310] truncate">
          {username}
        </p>
        {chatExpired ? (
          <p className="text-[10px] text-orange-600 italic">
            Chat expired - click to restore
          </p>
        ) : (
          <p className="text-xs text-[#74512D]/70">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        )}
      </div>
    </div>
  );
}
