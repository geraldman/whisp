'use client';

import Image from 'next/image';

const AVATARS = [
  {
    src: '/avatar/gerald.webp',
    name: 'Gerald',
    role: 'Full-Stack Engineer',
  },
  {
    src: '/avatar/keira.webp',
    name: 'Keira',
    role: 'Frontend Developer',
  },
  {
    src: '/avatar/qwyn.webp',
    name: 'Qwyn',
    role: 'UI/UX Developer',
  },
  {
    src: '/avatar/richie.webp',
    name: 'Richie',
    role: 'Backend Developer',
  },
];

export default function AvatarGroup() {
  return (
    <div className="flex items-center gap-3">

      {/* Dev Badge */}
      <div className="
        flex items-center justify-center
        w-10 h-10
        rounded-full
        bg-[#74512D]/10
        text-[#74512D]
        text-[9px]
        font-semibold
        uppercase
      ">
        Dev
      </div>

      {/* Avatars */}
      <div className="flex -space-x-3">
        {AVATARS.map((avatar, index) => (
          <div
            key={index}
            className="
              relative
              w-10 h-10
              rounded-full
              border-2 border-[#F8F4E1]
              bg-gray-200
              hover:z-20
              transition-transform
              hover:scale-105
              group
            "
          >
            {/* Avatar Image */}
            <div className="w-full h-full rounded-full overflow-hidden">
              <Image
                src={avatar.src}
                alt={avatar.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tooltip Bubble (BOTTOM) */}
            <div
              className="
                pointer-events-none
                absolute top-full left-1/2
                -translate-x-1/2
                mt-3
                z-50
                opacity-0
                scale-95
                -translate-y-1
                transition-all
                duration-200
                group-hover:opacity-100
                group-hover:scale-100
                group-hover:translate-y-0
              "
            >
              <div className="
                relative
                rounded-2xl
                bg-white
                px-3 py-2
                shadow-lg
              ">
                <p className="text-xs font-medium text-black whitespace-nowrap text-center">
                  {avatar.name}
                </p>
                <p className="text-[10px] font-light text-black/60 whitespace-nowrap mt-0.5">
                  {avatar.role}
                </p>

                {/* Arrow (pointing UP) */}
                <div className="
                  absolute left-1/2 -top-1
                  -translate-x-1/2
                  w-2.5 h-2.5
                  bg-white
                  rotate-45
                " />
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
