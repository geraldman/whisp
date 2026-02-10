'use client';

import { motion } from 'framer-motion';
import LockIcon from '@/app/components/icons/LockIcon';

export default function AboutContent() {
  return (
    <div className="h-full overflow-y-auto bg-[#F6F1E3] px-10 py-8">

      {/* HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl font-semibold text-[#543310]"
      >
        About WHISP
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-sm text-[#74512D]/70 mt-1 mb-8 max-w-xl"
      >
        Secure messaging built with privacy at its core.
      </motion.p>

      <div className="space-y-10">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/60 p-6 shadow-sm
                     hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-[#543310] mb-2">
            Private. Secure. Simple.
          </h2>
          <p className="text-sm text-[#74512D] leading-relaxed">
            WHISP is a private messaging platform designed to protect your
            conversations. Messages are secured with end-to-end encryption,
            ensuring that only you and the intended recipient can read them —
            not even WHISP.
          </p>
        </motion.div>

        {/* SECURITY */}
        <div>
          <h3 className="text-base font-semibold text-[#543310] mb-4">
            Security & Privacy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'End-to-end encrypted by default',
              'No access to message content',
              'Secure authentication sessions',
              'Privacy-first system architecture',
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="group flex items-start gap-3 rounded-xl
                           bg-white/50 p-4
                           hover:bg-white/70 transition"
              >
                <LockIcon className="w-4 h-4 text-[#543310] mt-0.5
                                     group-hover:scale-110 transition" />
                <p className="text-sm text-[#74512D]">
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* META */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white/60 p-6"
        >
          <div className="flex justify-between text-sm text-[#74512D]">
            <span>Version</span>
            <span className="font-medium text-[#543310]">
              v1.0.0
            </span>
          </div>

          <div className="flex justify-between text-sm text-[#74512D] mt-2">
            <span>Build</span>
            <span className="font-medium text-[#543310]">
              Stable
            </span>
          </div>
        </motion.div>

        {/* FOOTER (CONTENT BOTTOM) */}
        <div className="pt-10 pb-4 text-center">
          <p className="text-xs text-[#74512D]/60 hover:text-[#74512D] transition">
            © 2026 WHISP • All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
