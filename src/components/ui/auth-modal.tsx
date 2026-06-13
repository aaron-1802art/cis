"use client";

import { motion } from "framer-motion";
import { AuthForm } from "./auth-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] bg-[#0c0c0b] border border-white/[0.08] rounded-2xl p-8 sm:p-10 relative flex flex-col justify-between selection:bg-white/10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-[14px] font-mono tracking-wider cursor-pointer"
        >
          [ESC]
        </button>

        <AuthForm
          onSuccess={() => {
            if (onSuccess) onSuccess();
            onClose();
          }}
        />
      </motion.div>
    </div>
  );
}
