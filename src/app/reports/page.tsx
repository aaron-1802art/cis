import { createClient } from "@/lib/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Library",
  description: "Access and review your archived brand intelligence dossiers.",
};

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 select-none">
          <div className="max-w-[400px] flex flex-col items-center">
            <span className="text-[10px] font-mono tracking-[0.25em] text-white/30 uppercase block mb-3">
              RESTRICTED ARCHIVES
            </span>
            <h2 className="text-[32px] font-serif font-light text-[#f7f7f5] leading-tight mb-4">
              Registry locked.
            </h2>
            <p className="text-[13px] font-serif italic text-white/45 mb-8">
              Authentication credentials are required to view the brand intelligence dossiers compiled in these archives.
            </p>
            <Link
              href="/login"
              className="px-8 py-3 bg-gradient-to-b from-white to-[#e2e2e7] text-[#1d1d1f] text-[11px] font-semibold tracking-[0.15em] uppercase rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:brightness-95 hover:shadow-md hover:scale-[1.03] active:scale-[0.97] active:brightness-90"
            >
              Sign In to Archives
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { data: reports, error } = await supabase
    .from("analyses")
    .select("id, url, created_at, summary")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center text-red-300/60 font-mono text-center pt-24">
          [ERROR] ARCHIVE RETRIEVAL FAILED: {error.message}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto px-8 sm:px-12 pt-20 pb-32 w-full">
        <div className="border-b border-white/[0.06] pb-10 mb-16">
          <span className="text-[10px] font-mono tracking-[0.3em] text-white/30 uppercase">
            REGISTERED SCRUTINIES
          </span>
          <h1 className="text-[48px] sm:text-[72px] font-serif font-light tracking-tight leading-[1] mt-2 text-white">
            Library archives.
          </h1>
        </div>

        {(!reports || reports.length === 0) ? (
          <div className="py-24 text-left">
            <p className="text-white/30 font-serif italic text-lg">No brand dossiers currently compiled in this archive.</p>
            <Link href="/" className="inline-block mt-8 text-xs font-mono tracking-widest text-white/60 hover:text-white border-b border-white/20 pb-1 uppercase">
              Scout domain &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {reports.map((r: any) => {
              let domain = r.url;
              try { domain = new URL(r.url).hostname.replace(/^www\./, ''); } catch (e) {}

              const date = new Date(r.created_at).toLocaleDateString("en-US", {
                year: 'numeric', month: 'long', day: 'numeric'
              });

              return (
                <Link
                  href={`/reports/${r.id}`}
                  key={r.id}
                  className="group flex flex-col md:flex-row md:items-baseline justify-between py-10 border-b border-white/[0.05] hover:border-white/20 transition-colors duration-500 gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[32px] sm:text-[44px] font-serif font-light tracking-tight text-white/80 group-hover:text-white transition-colors italic capitalize">
                      {domain}
                    </h3>
                    <p className="text-[14px] text-white/40 font-serif line-clamp-1 max-w-[600px]">
                      {r.summary || "No executive summary compiled."}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-4 md:self-end">
                    <span className="text-[11px] font-mono tracking-widest text-white/20 group-hover:text-white/40 transition-colors uppercase">
                      COMPILED {date}
                    </span>
                    <span className="text-[12px] font-serif italic text-white/30 group-hover:text-white/60 transition-colors">
                      [DOSSIER]
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
