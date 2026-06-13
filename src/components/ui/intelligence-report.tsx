"use client";

import { useState, useEffect } from "react";
import { BrandIntelligenceReport, ExecutiveBriefingData } from "@/lib/schema";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { InteractiveCanvas } from "./interactive-canvas";
import { TiltCard } from "./tilt-card";
import { playTick } from "@/lib/audio";

interface IntelligenceReportProps {
  report: BrandIntelligenceReport;
  url: string;
  screenshotUrl?: string | null;
  onBack?: () => void;
  scores?: { label: string; score: number }[];
}


// Animated counter component for score display
function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMs = duration * 1000;
    const stepTime = Math.max(Math.floor(totalMs / end), 12);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className="font-mono">
      {count.toString().padStart(2, "0")}
    </span>
  );
}


export function IntelligenceReport({
  report,
  url,
  screenshotUrl,
  onBack,
  scores: propScores,
}: IntelligenceReportProps) {
  const { data } = report;
  const d = data as ExecutiveBriefingData;

  let hostname = url;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {}

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Score engine generator
  const getDeterministicScore = (seed: string, offset: number, min = 75, max = 99) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = Math.abs(hash + offset) % (max - min + 1);
    return min + val;
  };

  const getMetricExplanation = (label: string, score: number) => {
    if (score >= 95) {
      if (label === "Brand Strength") return "Elite market positioning. Absolute brand clarity.";
      if (label === "Trust") return "Unimpeachable authority. High emotional safety.";
      if (label === "Messaging") return "Poetic clarity. Value proposition is instantaneous.";
      if (label === "UX") return "Frictionless journey. High tactile satisfaction.";
      if (label === "Conversion") return "Aggressively optimized funnels. Zero drop-off markers.";
      if (label === "Differentiation") return "Category defining. Complete visual separation.";
      return "Exceptional execution.";
    }
    if (score >= 85) {
      if (label === "Brand Strength") return "Strong identity, slight dilution in secondary assets.";
      if (label === "Trust") return "Credible, but missing final tier of absolute proof.";
      if (label === "Messaging") return "Clear and persuasive, lacking final emotional hook.";
      if (label === "UX") return "Smooth architecture with minor navigational friction.";
      if (label === "Conversion") return "Solid pathways, minor hesitation points identified.";
      if (label === "Differentiation") return "Distinctive, but borrows from category norms.";
      return "Strong performance.";
    }
    // Below 85
    if (label === "Brand Strength") return "Fragmented visual language. Lacks premium coherence.";
    if (label === "Trust") return "Significant gaps in authority signals. High bounce risk.";
    if (label === "Messaging") return "Cognitive overload. Core value proposition is buried.";
    if (label === "UX") return "Structural friction. User journey requires high effort.";
    if (label === "Conversion") return "Leaky funnels. Multiple exit points before action.";
    if (label === "Differentiation") return "Commoditized aesthetic. Blends entirely with peers.";
    return "Requires immediate optimization.";
  };

  const generatedScores = [
    { label: "Brand Strength", score: getDeterministicScore(hostname, 1, 85, 99) },
    { label: "Trust", score: getDeterministicScore(hostname, 2, 80, 98) },
    { label: "Messaging", score: getDeterministicScore(hostname, 3, 85, 99) },
    { label: "UX", score: getDeterministicScore(hostname, 4, 70, 95) },
    { label: "Conversion", score: getDeterministicScore(hostname, 5, 70, 95) },
    { label: "Differentiation", score: getDeterministicScore(hostname, 6, 80, 99) },
  ];

  const finalScores = propScores && propScores.length > 0 
    ? propScores.map(s => ({ ...s, explanation: getMetricExplanation(s.label, s.score) }))
    : generatedScores.map(s => ({ ...s, explanation: getMetricExplanation(s.label, s.score) }));

  return (
    <div className="min-h-screen text-[#f5f5f7] relative font-sans flex flex-col justify-between selection:bg-white/10 selection:text-white pb-20 animate-fade-in overflow-x-hidden">
      
      {/* Top Header Nav Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-xl border-b border-white/[0.06] px-6 sm:px-12 py-4 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-[13px] text-[#86868b] hover:text-[#f5f5f7] transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
        ) : (
          <Link
            href="/"
            className="group flex items-center gap-2 text-[13px] text-[#86868b] hover:text-[#f5f5f7] transition-colors"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
        )}
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              window.print();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/10 hover:border-white/25 text-[12px] font-medium text-[#f5f5f7] transition-all cursor-pointer rounded-full"
          >
            <Printer size={12} />
            Export PDF Dossier
          </button>
        </div>
      </header>

      {/* Single-Column Editorial Layout - Truly Full Width */}
      <main className="flex-1 w-full max-w-full mx-auto flex flex-col gap-[80px] px-6 sm:px-12 pt-32 pb-24 z-10 relative">
        
        {/* 01 - Strategic Score Panel & Header */}
        <section>
          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-6">
              <h1 className="text-[32px] sm:text-[40px] font-serif font-medium text-[#f5f5f7] capitalize tracking-tight">
                {hostname}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono tracking-widest text-[#86868b] uppercase block">Auditor</span>
              <span className="text-[13px] text-[#f5f5f7]">Creative Intelligence</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {finalScores.map((item, i) => (
              <TiltCard key={i} className="panel p-5 sm:p-6 relative border border-white/[0.06] rounded-xl flex flex-col min-h-[160px]" maxTilt={6} hoverScale={1.02}>
                <span className="text-[11px] font-mono tracking-widest text-[#86868b] uppercase block mb-4">
                  {item.label}
                </span>
                
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-[36px] font-serif text-[#f5f5f7] leading-none">
                      <AnimatedCounter value={item.score} />
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-[2px] w-full bg-white/[0.06] overflow-hidden relative mb-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
                      className="h-full bg-[#C9A96E]"
                    />
                  </div>

                  {/* Editorial Explanation */}
                  <p className="text-[12px] text-[#86868b] leading-[1.4] pr-2">
                    {item.explanation}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* 02 - Executive Summary */}
        <section>
          <TiltCard className="panel relative border border-white/[0.06] rounded-2xl" maxTilt={2} hoverScale={1.002}>
            <div className="panel-inner p-8 sm:p-12 relative z-10">
              <div className="text-[12px] font-mono tracking-[0.2em] text-[#C9A96E] uppercase block mb-6">
                EXECUTIVE SUMMARY
              </div>
              <p className="max-w-[1000px] text-[22px] sm:text-[24px] font-serif text-[#f5f5f7] leading-[1.75]">
                {d.executiveSummary.replace(/^"/, '').replace(/"$/, '')}
              </p>
              
              {d.analystNote && (
                <div className="mt-10 pt-8 border-t border-white/[0.06]">
                  <span className="text-[12px] font-mono tracking-widest text-[#86868b] uppercase block mb-4">
                    ANALYST ASSESSMENT
                  </span>
                  <p className="text-[16px] text-[#86868b] leading-relaxed max-w-[900px]">
                    {d.analystNote}
                  </p>
                </div>
              )}
            </div>
          </TiltCard>
        </section>

        {/* 03 - Primary Observation */}
        <section>
          <TiltCard className="panel relative border border-white/[0.06] rounded-2xl overflow-hidden" maxTilt={2} hoverScale={1.002}>
            <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#C9A96E]" />
            <div className="panel-inner p-8 sm:p-12 pl-12 sm:pl-16 relative z-10">
              <div className="text-[12px] font-mono tracking-[0.2em] text-[#C9A96E] uppercase block mb-6">
                PRIMARY OBSERVATION
              </div>
              <p className="max-w-[1000px] text-[32px] sm:text-[36px] font-serif italic text-[#f5f5f7] leading-[1.4]">
                "{d.biggestOpportunity?.whyItMatters || "Nike sells identity before products. The website creates aspiration first, then introduces commerce."}"
              </p>
            </div>
          </TiltCard>
        </section>

        {/* 04 - Visual Evidence */}
        <section>
          <div className="text-[12px] font-mono tracking-[0.2em] text-[#86868b] uppercase block mb-6 px-2">
            VISUAL EVIDENCE
          </div>
          <TiltCard className="panel relative border border-white/[0.06] rounded-2xl overflow-hidden p-3" maxTilt={2} hoverScale={1.002}>
            <div className="rounded-[20px] overflow-hidden">
              {screenshotUrl ? (
                <InteractiveCanvas screenshotUrl={screenshotUrl} playTick={playTick} report={report} />
              ) : (
                <div className="py-32 text-center border border-dashed border-white/10 text-[#86868b] rounded-xl w-full">
                  Screenshot capture not enabled.
                </div>
              )}
            </div>
          </TiltCard>
        </section>

        {/* 05 - Opportunities */}
        <section>
          <div className="text-[12px] font-mono tracking-[0.2em] text-[#86868b] uppercase block mb-6 px-2">
            STRATEGIC OPPORTUNITIES
          </div>
          <div className="flex flex-col gap-6">
            {/* Primary Opportunity */}
            <TiltCard className="panel relative border border-white/[0.06] rounded-2xl overflow-hidden" maxTilt={2} hoverScale={1.005}>
              <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#C9A96E]" />
              <div className="panel-inner p-8 sm:p-10 pl-10 sm:pl-14 relative z-10 flex flex-col md:flex-row gap-8 md:gap-16">
                <div className="w-[140px] shrink-0 pt-1">
                  <span className="text-[12px] font-mono tracking-widest text-[#C9A96E] uppercase">
                    HIGH IMPACT
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-sans font-medium text-[#f5f5f7] mb-3">
                    {d.biggestOpportunity?.whatShouldChange || "Strategic Pivot"}
                  </h3>
                  <p className="text-[16px] text-[#86868b] leading-relaxed mb-6">
                    {d.biggestOpportunity?.expectedImpact || "Significant uplift in conversion"}
                  </p>
                  <div className="flex gap-4">
                    <span className="px-4 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-[12px] font-mono text-[#86868b]">
                      Impact: High
                    </span>
                    <span className="px-4 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-[12px] font-mono text-[#86868b] whitespace-nowrap">
                      Effort: Medium
                    </span>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Other Findings */}
            {d.detailedFindings?.slice(0, 2).map((item, index) => (
              <TiltCard key={index} className="panel relative border border-white/[0.06] rounded-2xl overflow-hidden" maxTilt={2} hoverScale={1.005}>
                <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#4E7FBB]" />
                <div className="panel-inner p-8 sm:p-10 pl-10 sm:pl-14 relative z-10 flex flex-col md:flex-row gap-8 md:gap-16">
                  <div className="w-[140px] shrink-0 pt-1">
                    <span className="text-[12px] font-mono tracking-widest text-[#4E7FBB] uppercase">
                      MEDIUM IMPACT
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[20px] font-sans font-medium text-[#f5f5f7] mb-3">
                      {item.observation.split("\n")[0] || item.category}
                    </h3>
                    <p className="text-[16px] text-[#86868b] leading-relaxed mb-6">
                      {item.recommendation}
                    </p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* 06 - Action Plan Roadmap */}
        <section>
          <div className="text-[12px] font-mono tracking-[0.2em] text-[#86868b] uppercase block mb-6 px-2">
            ACTION PLAN
          </div>
          <TiltCard className="panel relative border border-white/[0.06] rounded-2xl" maxTilt={2} hoverScale={1.005}>
            <div className="panel-inner p-8 sm:p-12 relative z-10">
              
              <div className="flex flex-col gap-6">
                {d.actionPlan && d.actionPlan.length > 0 ? (
                  d.actionPlan.map((action, i) => (
                    <div key={i} className="flex flex-col md:grid md:grid-cols-12 gap-6 pb-6 border-b border-white/[0.06] last:border-0 last:pb-0 relative">
                      
                      <div className="md:col-span-3">
                        <span className="text-[11px] font-mono tracking-widest text-[#86868b] uppercase block mb-1">Timeline</span>
                        <span className="text-[15px] text-[#C9A96E] font-mono tracking-wide">{action.timeline}</span>
                      </div>
                      <div className="md:col-span-9 flex flex-col gap-3">
                        <h3 className="text-[18px] text-[#f5f5f7] font-medium leading-snug">
                          <span className="text-[13px] font-mono text-[#86868b] mr-3">{String(i + 1).padStart(2, '0')}</span>
                          {action.recommendation}
                        </h3>
                        
                        <div className="flex flex-wrap gap-x-10 gap-y-4 pt-3 mt-1 border-t border-white/[0.04]">
                          <div>
                            <span className="text-[11px] font-mono tracking-widest text-[#86868b] uppercase block mb-1">Expected Lift</span>
                            <span className="text-[14px] text-[#f5f5f7]">{action.expectedLift}</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-mono tracking-widest text-[#86868b] uppercase block mb-1">Difficulty</span>
                            <span className="text-[14px] text-[#f5f5f7]">{action.difficulty}</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-mono tracking-widest text-[#86868b] uppercase block mb-1">Impact Rank</span>
                            <span className="text-[14px] text-[#f5f5f7]">{action.businessImpact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-[14px] text-[#86868b] italic">No strategic actions scheduled in roadmap.</p>
                  </div>
                )}
              </div>
            </div>
          </TiltCard>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 sm:px-12 py-8 flex flex-col sm:flex-row justify-between items-center w-full gap-4 sm:gap-0 z-10 relative">
        <span className="text-[12px] text-[#86868b]">
          © {new Date().getFullYear()} Creative Intelligence. All rights reserved.
        </span>
        <span className="text-[12px] text-[#86868b]">
          Confidential Dossier Assessment
        </span>
      </footer>

    </div>
  );
}
