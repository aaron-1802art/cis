"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppLayout } from "@/components/layout/app-layout";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { TiltCard } from "@/components/ui/tilt-card";
import { playTick } from "@/lib/audio";

interface AnalysisRecord {
  id: string;
  url: string;
  summary: string;
  scores: { label: string; score: number }[];
  screenshot_url?: string;
  created_at: string;
  domainName?: string;
}

const CATEGORIES = [
  "Brand Strength",
  "Trust",
  "Messaging",
  "UX",
  "Conversion",
  "Differentiation"
];


export default function ProjectsPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadAnalyses() {
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("id, url, scores, summary, screenshot_url, created_at")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        // Ensure every item has a formatted domain name and valid scores array
        const formatted = (data || []).map((item: any) => {
          let domain = item.url;
          try {
            domain = new URL(item.url).hostname.replace(/^www\./, "");
          } catch {}
          
          // Fallback scores if database is empty/corrupt
          const defaultScores = [
            { label: "Brand Strength", score: 85 },
            { label: "Trust", score: 80 },
            { label: "Messaging", score: 78 },
            { label: "UX", score: 88 },
            { label: "Conversion", score: 75 },
            { label: "Differentiation", score: 82 }
          ];

          return {
            ...item,
            domainName: domain,
            scores: item.scores && item.scores.length > 0 ? item.scores : defaultScores
          };
        });
        
        setAnalyses(formatted);
      } catch (err) {
        console.error("Failed to load competitor matrix:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalyses();
  }, []);

  const toggleBrand = (id: string) => {
    playTick();
    setSelectedBrands((prev) => {
      if (prev.includes(id)) {
        return prev.filter((bId) => bId !== id);
      }
      if (prev.length >= 2) {
        // Keep max 2 selected, swap first out
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const brandA = analyses.find((b) => b.id === selectedBrands[0]);
  const brandB = analyses.find((b) => b.id === selectedBrands[1]);

  // Radar chart helper calculations
  const cx = 160;
  const cy = 160;
  const r = 110;

  const getPoints = (record: AnalysisRecord) => {
    return CATEGORIES.map((cat, i) => {
      const match = record.scores.find((s) => s.label.toLowerCase() === cat.toLowerCase()) || { score: 70 };
      const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      const radius = (match.score / 100) * r;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  };

  const getLabelCoords = (i: number) => {
    const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
    const textRadius = r + 24;
    const x = cx + textRadius * Math.cos(angle);
    const y = cy + textRadius * Math.sin(angle);
    return { x, y };
  };

  // Compare winner helpers
  const getWinner = (cat: string) => {
    if (!brandA || !brandB) return null;
    const scoreA = brandA.scores.find((s) => s.label.toLowerCase() === cat.toLowerCase())?.score || 0;
    const scoreB = brandB.scores.find((s) => s.label.toLowerCase() === cat.toLowerCase())?.score || 0;
    if (scoreA > scoreB) return brandA;
    if (scoreB > scoreA) return brandB;
    return null; // Tie
  };

  const getWinnerScore = (cat: string) => {
    if (!brandA || !brandB) return 0;
    const scoreA = brandA.scores.find((s) => s.label.toLowerCase() === cat.toLowerCase())?.score || 0;
    const scoreB = brandB.scores.find((s) => s.label.toLowerCase() === cat.toLowerCase())?.score || 0;
    return Math.max(scoreA, scoreB);
  };

  // Overall winner calculation
  const getOverallWinner = () => {
    if (!brandA || !brandB) return null;
    const sumA = brandA.scores.reduce((sum, s) => sum + s.score, 0);
    const sumB = brandB.scores.reduce((sum, s) => sum + s.score, 0);
    if (sumA > sumB) return { winner: brandA, diff: Math.round((sumA - sumB) / 6) };
    if (sumB > sumA) return { winner: brandB, diff: Math.round((sumB - sumA) / 6) };
    return null;
  };

  const overall = getOverallWinner();

  return (
    <AppLayout>
      <div className="max-w-[1100px] mx-auto px-6 sm:px-12 py-12 flex-1 overflow-y-auto w-full selection:bg-white/10 selection:text-white">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 border-b border-white/[0.06] pb-6 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold tracking-wider text-[#86868b] uppercase">
              Web Matrix
            </span>
            <h1 className="text-3xl font-bold text-white tracking-tight">Compare Websites</h1>
          </div>
          <div className="text-[12px] text-[#86868b] bg-white/[0.04] border border-white/10 px-4 py-1.5 rounded-full">
            Active Analyses: {analyses.length}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full animate-pulse">
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="h-[380px] bg-white/[0.02] border border-white/[0.04] rounded-2xl p-6" />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="h-[320px] bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
              <div className="h-[280px] bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
            </div>
          </div>
        ) : analyses.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl p-8 max-w-xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-2">No dossiers detected</h3>
            <p className="text-[#86868b] text-sm mb-6">Create your first website analysis on the Scout dashboard to compare them.</p>
            <Link href="/" className="px-6 py-2.5 bg-white text-black hover:bg-[#e8e8ed] text-[13px] font-medium transition-colors rounded-full">
              Analyze Website
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Brand Selector List */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <TiltCard className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl relative" maxTilt={4} hoverScale={1.008}>
                <h3 className="text-[13px] font-semibold text-white mb-3">
                  Select Competitors
                </h3>
                <p className="text-[#86868b] text-[13px] leading-relaxed mb-6">
                  Select two brands from your private archive to compare their performance vectors side by side.
                </p>

                <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {analyses.map((rec) => {
                    const isSelected = selectedBrands.includes(rec.id);
                    const index = selectedBrands.indexOf(rec.id);
                    return (
                      <button
                        key={rec.id}
                        onClick={() => toggleBrand(rec.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? index === 0
                              ? "bg-white/[0.08] border-white/40 shadow-sm"
                              : "bg-white/[0.04] border-white/20 shadow-sm"
                            : "bg-white/[0.01] border-white/[0.04] hover:border-white/20 hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex flex-col gap-1 overflow-hidden pr-2">
                          <span className="text-[13px] font-semibold text-white truncate">
                            {rec.domainName}
                          </span>
                          <span className="text-[11px] text-[#86868b]">
                            Scanned {new Date(rec.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {isSelected && (
                          <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ${
                            index === 0 ? "bg-white text-black" : "bg-white/30 text-white"
                          }`}>
                            {index === 0 ? "A" : "B"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </TiltCard>
            </div>

            {/* Right Column: Comparative Engine Dashboard */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {brandA && brandB ? (
                <div className="flex flex-col gap-6 animate-fade-in">
                  
                  {/* Visual Dual-Radar Chart Panel */}
                  <TiltCard className="p-6 sm:p-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col md:flex-row items-center gap-8" maxTilt={3} hoverScale={1.005}>
                    
                    {/* Radar SVG Area */}
                    <div className="w-[320px] h-[320px] shrink-0 relative flex items-center justify-center">
                      <svg width="320" height="320" className="overflow-visible">
                        {/* 5 Concentric Hexagons */}
                        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, step) => {
                          const points = CATEGORIES.map((_, i) => {
                            const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
                            const radius = scale * r;
                            return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
                          }).join(" ");
                          return (
                            <polygon
                              key={step}
                              points={points}
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.04)"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Spoke Axes */}
                        {CATEGORIES.map((_, i) => {
                          const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
                          return (
                            <line
                              key={i}
                              x1={cx}
                              y1={cy}
                              x2={cx + r * Math.cos(angle)}
                              y2={cy + r * Math.sin(angle)}
                              stroke="rgba(255, 255, 255, 0.05)"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Spoke Labels */}
                        {CATEGORIES.map((cat, i) => {
                          const coords = getLabelCoords(i);
                          let textAnchor: "start" | "middle" | "end" = "middle";
                          if (Math.cos((i * 2 * Math.PI) / 6 - Math.PI / 2) > 0.1) textAnchor = "start";
                          else if (Math.cos((i * 2 * Math.PI) / 6 - Math.PI / 2) < -0.1) textAnchor = "end";

                          return (
                            <text
                              key={i}
                              x={coords.x}
                              y={coords.y + 4}
                              fill="#86868b"
                              fontSize="10"
                              textAnchor={textAnchor}
                              className="select-none font-medium"
                            >
                              {cat}
                            </text>
                          );
                        })}

                        {/* Brand A Polygon (White) */}
                        <polygon
                          points={getPoints(brandA)}
                          fill="rgba(255, 255, 255, 0.08)"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-500"
                        />

                        {/* Brand B Polygon (Gray) */}
                        <polygon
                          points={getPoints(brandB)}
                          fill="rgba(255, 255, 255, 0.02)"
                          stroke="rgba(255, 255, 255, 0.4)"
                          strokeWidth="2"
                          className="transition-all duration-500"
                        />
                      </svg>
                    </div>

                    {/* Quick Specs Summary */}
                    <div className="flex-1 flex flex-col justify-center w-full">
                      <div className="text-[12px] font-semibold tracking-wider text-[#86868b] uppercase block mb-4">
                        Comparison Overview
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-l-2 border-white pl-4">
                          <span className="text-[13px] text-[#86868b] truncate max-w-[150px]">
                            {brandA.domainName} (A)
                          </span>
                          <span className="text-[18px] font-bold text-white">
                            {Math.round(brandA.scores.reduce((sum, s) => sum + s.score, 0) / 6)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between border-l-2 border-white/40 pl-4">
                          <span className="text-[13px] text-[#86868b] truncate max-w-[150px]">
                            {brandB.domainName} (B)
                          </span>
                          <span className="text-[18px] font-bold text-white">
                            {Math.round(brandB.scores.reduce((sum, s) => sum + s.score, 0) / 6)}%
                          </span>
                        </div>
                      </div>

                      {overall && (
                        <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-start gap-3">
                          <Trophy size={16} className="text-white shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[12px] font-semibold text-white tracking-wide">
                              Performance Margin
                            </p>
                            <p className="text-[13px] text-[#86868b] mt-1">
                              <span className="text-white font-semibold uppercase">{(overall.winner as AnalysisRecord).domainName}</span> leads by <span className="text-white font-bold">{overall.diff} points</span> on average.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TiltCard>

                  {/* Comparative Scorecard List */}
                  <TiltCard className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl" maxTilt={3} hoverScale={1.005}>
                    <h3 className="text-[13px] font-semibold text-white mb-6">
                      Metrics Comparison
                    </h3>

                    <div className="flex flex-col gap-4">
                      {CATEGORIES.map((cat, idx) => {
                        const scoreA = brandA.scores.find((s) => s.label.toLowerCase() === cat.toLowerCase())?.score || 0;
                        const scoreB = brandB.scores.find((s) => s.label.toLowerCase() === cat.toLowerCase())?.score || 0;
                        const winner = getWinner(cat);

                        return (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 items-center pb-4 border-b border-white/[0.04] last:border-0 last:pb-0 gap-3">
                            <div className="md:col-span-4 flex flex-col">
                              <span className="text-[13px] font-semibold text-white">
                                {cat}
                              </span>
                            </div>
                            
                            <div className="md:col-span-5 flex items-center gap-6 justify-between md:justify-start">
                              <div className="flex items-baseline gap-1.5 w-16">
                                <span className="text-[14px] text-white font-medium">{scoreA}</span>
                                <span className="text-[10px] text-[#86868b]">/A</span>
                              </div>
                              
                              <div className="flex items-baseline gap-1.5 w-16">
                                <span className="text-[14px] text-white font-medium">{scoreB}</span>
                                <span className="text-[10px] text-[#86868b]">/B</span>
                              </div>
                            </div>

                            <div className="md:col-span-3 flex items-center justify-end">
                              {winner ? (
                                <div className="flex items-center gap-1.5 text-[11px] text-[#86868b]">
                                  <span className="truncate max-w-[80px] text-white font-medium">{(winner as AnalysisRecord).domainName}</span> (+{Math.abs(scoreA - scoreB)})
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#86868b]">Tied</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TiltCard>

                </div>
              ) : (
                <div className="p-12 text-center border border-white/5 bg-white/[0.01] rounded-2xl text-[#86868b] py-24 flex flex-col items-center justify-center">
                  Select two brands on the left panel to overlay their diagnostic metrics.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
