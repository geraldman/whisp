"use client";

type ContactInfoProps = {
  onClose: () => void;
};

export default function ContactInfo({ onClose }: ContactInfoProps) {
  return (
    <div className="absolute inset-0 z-50 flex">
      {/* OVERLAY */}
      <div className="flex-1 bg-black/25" onClick={onClose} />

      {/* SIDE SHEET */}
      <div
        className="w-[360px] h-full bg-[#F6F1E3]
                   shadow-[-8px_0_24px_rgba(0,0,0,0.18)]
                   flex flex-col"
      >
        {/* HEADER */}
        <div className="px-5 h-14 flex items-center justify-between
                        border-b border-[#74512D]/10">
          <p className="text-sm font-semibold text-[#543310]">
            Contact Info
          </p>

          <button
            onClick={onClose}
            className="cursor-pointer w-8 h-8 flex items-center justify-center
                       rounded-full text-[#74512D]
                       hover:bg-[#E6D5BC] transition"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* PROFILE */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-24 h-24 rounded-full bg-white
                         border border-[#74512D]/20
                         flex items-center justify-center mb-3"
            >
              <span className="text-3xl font-semibold text-[#543310]">
                A
              </span>
            </div>

            <p className="text-lg font-semibold text-[#543310]">
              Aliceeee_
            </p>

            <div
              className="mt-2 px-3 py-1 rounded-full
                         bg-[#E6D5BC]/60
                         text-[11px] text-[#74512D]"
            >
              ID · 567832
            </div>
          </div>

          {/* BIO */}
          <div
            className="mb-6 rounded-2xl bg-white/70
                       border border-[#74512D]/10 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-full rounded-full bg-[#74512D]/60" />
              <div>
                <p className="text-xs uppercase tracking-wide
                              text-[#74512D]/60 mb-1">
                  Bio
                </p>
                <p className="text-sm text-[#543310] leading-relaxed">
                  Frontend enthusiast. Love to chat!
                </p>
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div
            className="mb-8 rounded-2xl bg-white/60
                       border border-[#74512D]/10 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-full rounded-full bg-[#74512D]/40" />
              <div>
                <p className="text-xs uppercase tracking-wide
                              text-[#74512D]/60 mb-1">
                  About
                </p>
                <p className="text-sm text-[#543310]/85 leading-relaxed">
                  HI, I'm Alice
                </p>
              </div>
            </div>
          </div>

          {/* DELETE */}
          <button
            className="cursor-pointer w-full py-3 rounded-xl
                       border border-red-500/25
                       text-red-600 text-sm font-medium
                       hover:bg-red-50
                       active:scale-[0.98]
                       transition"
          >
            Delete friend
          </button>
        </div>
      </div>
    </div>
  );
}
