'use client';

const AVATARS = [
  {
    src: 'https://pbs.twimg.com/profile_images/1948770261848756224/oPwqXMD6_400x400.jpg',
    name: 'Gerald',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
    name: 'Keira',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg',
    name: 'Qwyn',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg',
    name: 'Richie',
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
              <img
                src={avatar.src}
                alt={avatar.name}
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
                px-3 py-1.5
                text-xs
                font-small
                text-black
                shadow-lg
              ">
                {avatar.name}

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
