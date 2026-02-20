"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";

type LoadingScreenProps = {
  subtitle?: string;
  text?: string;
};

export default function LoadingScreen({
  subtitle = "Loading your messages",
  text = "End-to-end encryption",
}: LoadingScreenProps) {
  const router = useRouter();
  const [dots, setDots] = useState("");

  // Typing dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    // (testing)
    localStorage.clear();
    sessionStorage.clear();
    router.replace(routes.home);
  }

  return (
    <main className="w-screen h-screen bg-[#F8F4E1] flex flex-col items-center justify-center relative">

      {/* Content */}
      <div className="flex flex-col items-center text-center">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="WHISPXR Logo"
          width={230}
          height={60}
          priority
        />

        {/* Loader dots */}
        <div className="flex gap-2 mt-6">
          <span className="w-3 h-3 rounded-full bg-[#74512D] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-3 h-3 rounded-full bg-[#74512D] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-3 h-3 rounded-full bg-[#74512D] animate-bounce" />
        </div>

        {/* Animated subtitle */}
        <p className="mt-8 text-base font-medium tracking-wide text-[#74512D]">
          {subtitle}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>

        {/* Encryption note */}
        <p className="mt-1 text-xs tracking-wide text-black/40">
          {text}
        </p>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="
            cursor-pointer  
            mt-12
            px-10 py-2
            rounded-full

            text-xs font-medium
            text-[#74512D]

            bg-[#74512D]/10
            border border-[#74512D]/20

            transition-all duration-200 ease-out
            hover:bg-[#74512D]/20
            hover:scale-[1.03]
            active:scale-[0.97]
          "
        >
          Log out
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full z-30 text-center">
        <p className="text-xs text-black/40 transition-colors duration-300 hover:text-black/70">
          © 2026 WHISPXR • All rights reserved.
        </p>
      </footer>
    </main>
  );
}
