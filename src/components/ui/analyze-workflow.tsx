"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IntelligenceReport } from "./intelligence-report";
import { BrandIntelligenceReport } from "@/lib/schema";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "./auth-modal";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { TiltCard } from "./tilt-card";
import type { User } from "@supabase/supabase-js";

interface ScoreItem {
  label: string;
  score: number;
}

type ViewState = "input" | "loading" | "error" | "report";

export function AnalyzeWorkflow() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>("input");
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [inlineReport, setInlineReport] = useState<BrandIntelligenceReport | null>(null);
  const [inlineScreenshot, setInlineScreenshot] = useState<string | null>(null);
  const [inlineScores, setInlineScores] = useState<ScoreItem[] | null>(null);
  const [dbWarning, setDbWarning] = useState<string | null>(null);

  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
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
  }, []);

  const handleAnalyze = async () => {
    if (!url) return;
    try {
      setView("loading");
      setErrorMessage("");
      setDbWarning(null);
      setLoadingStep(0);

      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 3000);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      clearInterval(interval);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate report.");
      }

      // If we got a reportId, navigate to the dedicated page
      if (data.reportId) {
        setLoadingStep(5);
        setTimeout(() => router.push(`/reports/${data.reportId}`), 1000);
        return;
      }

      // If DB save failed but we have a report, show it inline
      if (data.report) {
        setInlineReport(data.report);
        setInlineScreenshot(data.screenshotUrl || null);
        setInlineScores(data.scores || null);
        setDbWarning(data.dbError || "Report could not be saved to database.");
        setLoadingStep(5);
        setTimeout(() => setView("report"), 1000);
        return;
      }

      throw new Error("No report data received.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Scrutiny failed.");
      setView("error");
    }
  };

  const handleSaveDossier = async () => {
    if (!inlineReport) return;
    
    // Get fresh user session check
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          report: inlineReport,
          screenshotUrl: inlineScreenshot,
          scores: inlineScores,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save dossier.");
      }
      if (data.id) {
        router.push(`/reports/${data.id}`);
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save report.");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    "Scouting brand domain & capturing assets",
    "Scrutinizing layout & interface architecture",
    "Evaluating copywriting & brand messaging",
    "Deconstructing conversion loops & friction points",
    "Synthesizing confidential brand intelligence dossier"
  ];

  if (view === "report" && inlineReport) {
    return (
      <AppLayout hideHeader hideFooter>
        <div className="flex-1">
          {dbWarning && (
            <div className="bg-white/[0.02] border-b border-white/[0.05] px-6 py-2.5 text-center">
              <p className="text-[12px] font-mono text-white/40 tracking-wider">
                [WARNING] DB WRITE FAILED (EPHEMERAL DOSSIER)
              </p>
            </div>
          )}
          <IntelligenceReport
            report={inlineReport}
            url={url}
            screenshotUrl={inlineScreenshot}
            scores={inlineScores || undefined}
            onBack={() => setView("input")}
          />
        </div>

        {/* Floating Premium Save Dossier Banner */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0c0c0b]/90 backdrop-blur-md border-t border-white/[0.08] px-8 py-5">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-[0.25em] text-white/30 uppercase">
                EPHEMERAL PREVIEW
              </span>
              <p className="text-[13px] font-serif italic text-white/60">
                This brand dossier is currently temporary. Persist it in your private archives.
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2">
              {saveError && (
                <p className="text-[11px] text-[#ff453a] font-medium">
                  {saveError}
                </p>
              )}
              <button
                onClick={() => { setSaveError(null); handleSaveDossier(); }}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-b from-white to-[#e2e2e7] text-[#1d1d1f] text-[11px] font-semibold tracking-[0.15em] uppercase rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:brightness-95 hover:shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-50"
              >
                {saving ? "Persisting..." : "Save to Library"}
              </button>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleSaveDossier}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-16 z-10 w-full relative">
        <AnimatePresence mode="wait">
          {view === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              className="w-full max-w-[800px] flex flex-col items-center text-center gap-8"
            >
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-semibold tracking-wider text-[#86868b] uppercase">
                  Website Auditor
                </span>
                <h1 className="text-[36px] sm:text-[56px] font-bold tracking-tight leading-[1.15] text-[#f5f5f7] max-w-[16ch]">
                  Understand what makes a website win.
                </h1>
                <p className="text-[16px] sm:text-[18px] text-[#86868b] max-w-[580px] leading-relaxed mt-2 mx-auto">
                  Analyze positioning, messaging, UX, trust, and growth opportunities through advanced AI scrutiny.
                </p>
              </div>

              {/* Glass Hero Module Panel */}
              <TiltCard className="panel w-full" maxTilt={4} hoverScale={1.005}>
                <div className="panel-inner">
                  {/* Input Shell */}
                  <div className="input-shell">
                    <div className="prefix">
                      <span>Analyze</span>
                    </div>
                    <input
                      type="url"
                      inputMode="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                      placeholder="Enter a domain (e.g. apple.com)"
                      className="flex-1 bg-transparent border-0 outline-none text-white text-[15px] sm:text-[16px] py-3.5 px-2 placeholder-white/20"
                      autoFocus
                    />
                    <button
                      ref={buttonRef}
                      onClick={handleAnalyze}
                      disabled={!url}
                      className="cta disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Run Analysis
                    </button>
                  </div>

                  {/* Chips */}
                  <div className="chips">
                    {["apple.com", "nike.com", "gymshark.com", "notion.so", "airbnb.com", "stripe.com"].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setUrl(`https://${suggestion}`);
                          setTimeout(() => {
                            buttonRef.current?.focus();
                          }, 50);
                        }}
                        className="chip"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <p className="microcopy text-[#86868b] text-[13px] mt-2">
                    Used by builders, designers, and growth-focused brands.
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {view === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              {/* Spinning/pulsing minimal indicator */}
              <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />

              <div className="flex flex-col gap-1 min-h-[50px] justify-center mt-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-[16px] font-medium text-[#f5f5f7] tracking-tight"
                  >
                    {steps[loadingStep] || "Compiling brand intelligence..."}
                  </motion.p>
                </AnimatePresence>
                <span className="text-[12px] text-[#86868b]">
                  Analyzing digital experience
                </span>
              </div>
            </motion.div>
          )}

          {view === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center max-w-md gap-6"
            >
              <p className="text-[15px] text-[#ff453a] font-medium">Error: {errorMessage}</p>
              <button
                onClick={() => setView("input")}
                className="px-6 py-2.5 border border-white/10 hover:border-white/25 hover:bg-white/[0.04] text-[13px] font-medium rounded-full transition-all cursor-pointer"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
