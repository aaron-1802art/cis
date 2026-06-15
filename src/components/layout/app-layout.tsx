"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface AppLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const NAV_LINKS = [
  { href: "/", label: "Scout" },
  { href: "/pricing", label: "Pricing" },
  { href: "/reports", label: "Library" },
  { href: "/projects", label: "Projects" },
];

export function AppLayout({ children, hideHeader = false, hideFooter = false }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen text-[#f5f5f7] font-sans flex flex-col selection:bg-white/10 selection:text-white relative">
      
      {/* Global Navigation Header */}
      {!hideHeader && (
        <header className="border-b border-white/[0.06] px-6 sm:px-12 py-4 z-30 bg-black/60 backdrop-blur-xl sticky top-0">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-[14px] font-semibold tracking-tight text-[#f5f5f7] hover:opacity-85 transition-opacity">
                Creative Intelligence
              </Link>
              {/* Desktop Nav */}
              <nav className="hidden sm:flex items-center gap-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[13px] transition-colors ${
                      isActive(link.href) ? "text-[#f5f5f7] font-medium" : "text-[#86868b] hover:text-[#f5f5f7]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#86868b] hidden md:inline">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-3.5 py-1.5 border border-white/10 hover:border-white/25 hover:bg-white/[0.04] text-[12px] font-medium text-[#f5f5f7] rounded-full transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-1.5 bg-gradient-to-b from-white to-[#e2e2e7] text-[#1d1d1f] text-[12px] font-semibold rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:brightness-95 hover:shadow-md hover:scale-[1.03] active:scale-[0.97] active:brightness-90"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-[#86868b] hover:text-white transition-colors cursor-pointer"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-white/[0.06] mt-4 pt-4 pb-2">
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                      isActive(link.href)
                        ? "text-[#f5f5f7] font-medium bg-white/[0.04]"
                        : "text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.02]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col z-10 relative">
        {children}
      </main>

      {/* Global Footer */}
      {!hideFooter && (
        <footer className="border-t border-white/[0.06] px-6 sm:px-12 py-8 z-10">
          <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px] text-[#86868b]">
            <span>© {new Date().getFullYear()} Creative Intelligence. All rights reserved.</span>
            <span>Confidential Report Registry</span>
          </div>
        </footer>
      )}
    </div>
  );
}
