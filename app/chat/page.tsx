'use client';

export default function ChatPage() {
  const username = 'Gerald';

  return (
    <div className="relative h-full flex items-center justify-center overflow-hidden bg-[#AF8F6F]/20">

      {/* Soft background accents */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#74512D]/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#AF8F6F]/15 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-sm px-4">
        <h1 className="text-2xl font-semibold text-[#2B1B12] mb-3">
          Welcome, {username}
        </h1>

        <p className="text-sm text-[#8A7F73] mb-8 leading-relaxed">
          Select a chat to start a private conversation.
        </p>

        <div
          className="inline-flex items-center gap-2 px-4 py-2
                     rounded-full bg-white/70
                     border border-[#74512D]/10
                     shadow-sm text-xs text-[#74512D]"
        >
          End-to-end encrypted messaging
        </div>
      </div>
    </div>
  );
}
