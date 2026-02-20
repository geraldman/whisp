"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import LiquidEtherBG from "./components/background";
import AvatarGroup from "./components/avatarGroup";

export default function Home() {
  return (
    <main className="w-full min-h-[100dvh] overflow-hidden relative px-4 sm:px-6 lg:px-8">

      {/* Background */}
      <div className="absolute inset-0 bg-[#F8F4E1] z-10 pointer-events-none">
        <LiquidEtherBG
          colors={["#5C3A21", "#AF8F6F", "#F8F4E1"]}
          mouseForce={20}
          cursorSize={100}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-4 left-4 sm:left-6 top-5 lg:left-20 z-30 flex items-center gap-2"
      >
        <Image
          src="/logo.png"
          alt="WHISP Logo"
          width={160}
          height={60}
          className="object-contain"
        />
      </motion.div>

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="absolute top-6 right-20 z-30 flex items-center gap-2"
      >
        <AvatarGroup />
      </motion.div>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl font-semibold tracking-tight text-[#5C3A21] -mt-10 max-w-xl text-center"
        >
          Secure Messaging for Everyday Conversations
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="text-black mt-6 text-center max-w-xl leading-relaxed"
        >
          Privacy-first messaging app powered by end-to-end encryption,
          so only you and your recipient can read what’s shared.
        </motion.p>

        {user ? (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="mt-8 sm:mt-12 lg:mt-16"
          >
            <Link href={routes.chats}>
              <button
                className="
                  cursor-pointer
                  w-32 sm:w-40 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl
                  bg-[#74512D]
                  text-sm sm:text-base text-white font-medium
                  shadow-md shadow-black/20
                  transition-all duration-300 ease-out
                  hover:-translate-y-1
                  hover:shadow-lg
                  hover:shadow-[#74512D]/40
                  active:scale-95
                "
              >
                Open Chat
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mt-10 sm:mt-16 w-full sm:w-auto"
          >
            {/* Login */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Link href="/auth">
                <button
                  className="
                    cursor-pointer
                    w-full sm:w-44 lg:w-48
                    min-h-[52px] px-6 rounded-xl
                    bg-[#74512D]
                    text-base sm:text-sm text-white font-medium
                    shadow-md shadow-black/20
                    transition-all duration-300 ease-out
                    hover:-translate-y-1
                    hover:shadow-lg
                    hover:shadow-[#74512D]/40
                    active:scale-95
                  "
                >
                  Login
                </button>
              </Link>
            </motion.div>

            {/* Register */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Link href="/auth">
                <button
                  className="
                    cursor-pointer
                    w-full sm:w-44 lg:w-48
                    min-h-[52px] px-6 rounded-xl
                    text-base sm:text-sm text-[#74512D] font-medium
                    bg-white/70
                    shadow-sm
                    transition-all duration-300 ease-out
                    hover:-translate-y-1
                    hover:bg-[#74512D]
                    hover:text-white
                    hover:shadow-lg
                    hover:shadow-[#74512D]/40
                    active:scale-95
                  "
                >
                  Register
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-6 w-full z-30 text-center"
      >
        <p className="text-xs text-black/40 transition-colors duration-300 hover:text-black/70">
          © 2026 WHISP • All rights reserved.
        </p>
      </motion.footer>

    </main>
  );
}
