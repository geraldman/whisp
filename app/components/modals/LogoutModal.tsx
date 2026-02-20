'use client';

import { motion } from 'framer-motion';

export default function LogoutModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-2xl
                   bg-[#F6F1E3] p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-[#543310] mb-2">
          Log out?
        </h2>

        <p className="text-sm text-[#74512D]/80 mb-6">
          Are you sure you want to log out of Whispxr?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 rounded-full text-sm
                       text-[#74512D]
                       hover:bg-[#AF8F6F]/20 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="cursor-pointer px-5 py-2 rounded-full text-sm font-medium
                       bg-[#74512D] text-white
                       hover:bg-[#5f3f22] transition"
          >
            Log out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
