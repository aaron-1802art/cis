"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthForm } from "@/components/ui/auth-form";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AppLayout hideHeader hideFooter>
      <div className="flex-1 flex flex-col justify-between selection:bg-white/10 relative overflow-hidden">
        {/* Top Header */}
        <header className="px-8 sm:px-12 py-10 z-10 flex justify-between items-center w-full">
          <Link
            href="/"
            className="text-[12px] font-medium tracking-wider text-white/40 hover:text-white transition-colors"
          >
            ← Back to Scout
          </Link>
          <span className="text-[11px] font-mono tracking-[0.25em] text-white/20 uppercase">
            Secure Access
          </span>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px] bg-[#0c0c0b] border border-white/[0.08] rounded-2xl p-8 sm:p-10"
          >
            <AuthForm
              onSuccess={() => {
                router.push("/");
                router.refresh();
              }}
            />
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="px-8 sm:px-12 py-10 z-10 flex flex-col sm:flex-row justify-between items-center w-full gap-4 sm:gap-0">
          <span className="text-[9px] font-mono tracking-[0.3em] text-white/20 uppercase">
            © {new Date().getFullYear()} Creative Intelligence Studio
          </span>
          <span className="text-[9px] font-mono tracking-[0.3em] text-white/20 uppercase">
            Confidential
          </span>
        </footer>
      </div>
    </AppLayout>
  );
}
