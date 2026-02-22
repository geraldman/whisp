"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

const letters = ["W", "H", "I", "S", "P", "X", "R"];

/* ================= SIZE TUNING ================= */
const BOX = 44;
const GAP = 12;
const STEP = BOX + GAP;
const HALF_BOX = BOX / 2;
const START_OFFSET = STEP * 1.3;

export default function LoadingScreen() {
  const router = useRouter();
  const sweepX = useMotionValue(-START_OFFSET);

  /* ================= LOGOUT ================= */
  async function handleLogout() {
    try {
      await signOut(auth);

      // optional cleanup jika kamu punya key custom
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");

      router.replace(routes.home);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  /* ================= SWEEP MOTION ================= */
  useEffect(() => {
    const maxX = STEP * (letters.length - 1);
    const END_OFFSET = maxX + START_OFFSET;

    const controls = animate(
      sweepX,
      [-START_OFFSET, END_OFFSET, -START_OFFSET],
      {
        duration: 5.8,
        ease: "easeInOut",
        repeat: Infinity,
      }
    );

    return () => controls.stop();
  }, [sweepX]);

  return (
    <main className="w-full min-h-[100dvh] bg-gradient-to-br from-[#F8F4E1] via-[#F4EEDB] to-[#EFE6CF] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="flex flex-col items-center">

        {/* ================= LETTER ROW ================= */}
        <div className="relative flex gap-3 mb-12">
          {letters.map((letter, i) => {
            const center = i * STEP + HALF_BOX;

            const distance = useTransform(sweepX, (x) =>
              Math.abs(x - center)
            );

            const jumpY = useTransform(
              distance,
              [0, 36, 80],
              [-22, -6, 0]
            );

            return (
              <motion.div
                key={i}
                style={{ y: jumpY }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 24,
                }}
                className="
                  w-10 h-10 sm:w-11 sm:h-11
                  rounded-lg
                  bg-gradient-to-br from-[#C9B29A] to-[#6B4A2E]
                  text-white/95
                  flex items-center justify-center
                  text-sm font-semibold
                  shadow-[0_6px_18px_rgba(0,0,0,0.18)]
                "
              >
                {letter}
              </motion.div>
            );
          })}

          {/* ================= MESSAGE BUBBLE ================= */}
          <motion.div style={{ x: sweepX }} className="absolute top-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11">

              {/* bubble body */}
              <div
                className="
                  absolute inset-0
                  rounded-[18px]
                  bg-[#F3EEE6]
                  border border-[#8B6B4A]/20
                  shadow-[0_8px_20px_rgba(0,0,0,0.12)]
                "
              />

              {/* soft highlight */}
              <div
                className="
                  absolute inset-0
                  rounded-[18px]
                  bg-gradient-to-b from-white/35 to-transparent
                  pointer-events-none
                "
              />

              {/* tail */}
              <div
                className="
                  absolute
                  bottom-[-2px]
                  left-[10px]
                  w-[12px] h-[12px]
                  bg-[#F3EEE6]
                  border-l border-b border-[#8B6B4A]/20
                  rounded-bl-[4px]
                  rotate-[-45deg]
                "
              />
            </div>
          </motion.div>
        </div>

        {/* ================= LOADING TEXT ================= */}
        <motion.p
          className="text-[15px] sm:text-base font-medium tracking-wide text-[#6B553C]"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          Loading your messages...
        </motion.p>

        <p className="mt-1 text-xs text-black/40">
          End-to-end encryption
        </p>

        {/* ================= LOGOUT ================= */}
        <button
          onClick={handleLogout}
          className="
            cursor-pointer
            mt-10
            px-10 py-2.5
            rounded-full
            text-sm font-medium
            text-[#6B553C]
            bg-[#6B553C]/10
            border border-[#6B553C]/25
            transition-all duration-200 ease-out
            hover:bg-[#6B553C]/15
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          Log out
        </button>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="absolute bottom-6 w-full text-center">
        <p className="text-xs text-black/40 hover:text-black/70 transition-colors">
          © 2026 WHISPXR • All rights reserved.
        </p>
      </footer>
    </main>
  );
}