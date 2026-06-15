"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, X, Code, CheckSquare } from "lucide-react";

import { BrandIntelligenceReport } from "@/lib/schema";

interface Annotation {
  id: number;
  label: string;
  top: string;
  left: string;
  box: { top: string; left: string; width: string; height: string };
  details: {
    title: string;
    critique: string;
    copyRecommendation: string;
    codeSnippet: string;
  };
}

function generateAnnotationsFromReport(report?: BrandIntelligenceReport): Annotation[] {
  if (!report) return [];
  
  return [
    {
      id: 1,
      label: "↑ Positioning & Hero",
      top: "12%",
      left: "50%",
      box: { top: "5%", left: "10%", width: "80%", height: "25%" },
      details: {
        title: "Value Proposition",
        critique: report.positioning?.uniqueValueProposition || "Hero section lacks a strong unique value proposition.",
        copyRecommendation: "Refine messaging to focus on core differentiation.",
        codeSnippet: `<h1 className="font-serif tracking-tight text-white/90">
  ${report.messaging?.taglineOptions?.[0] || "Your compelling headline here."}
</h1>`
      }
    },
    {
      id: 2,
      label: "← Messaging & Tone",
      top: "48%",
      left: "22%",
      box: { top: "42%", left: "8%", width: "42%", height: "16%" },
      details: {
        title: "Brand Voice",
        critique: report.messaging?.toneAndVoice || "Tone and voice are inconsistent across the page.",
        copyRecommendation: "Ensure all copy aligns with the desired brand personality.",
        codeSnippet: `<p className="text-[#86868b] leading-relaxed">
  ${report.messaging?.taglineOptions?.[1] || "Supporting subheadline reinforcing value."}
</p>`
      }
    },
    {
      id: 3,
      label: "↓ UX & Friction",
      top: "76%",
      left: "68%",
      box: { top: "70%", left: "45%", width: "48%", height: "22%" },
      details: {
        title: "Conversion Flow",
        critique: report.uxFrictionPoints?.[0] || "Potential friction points detected in the user journey.",
        copyRecommendation: "Streamline the flow to reduce drop-off.",
        codeSnippet: `<button className="bg-white text-black px-6 py-2.5 rounded-full font-medium">
  [ Primary Call to Action ]
</button>`
      }
    }
  ];
}

interface InteractiveCanvasProps {
  screenshotUrl: string;
  playTick?: () => void;
  report?: BrandIntelligenceReport;
}

export function InteractiveCanvas({ screenshotUrl, playTick, report }: InteractiveCanvasProps) {
  const annotations = generateAnnotationsFromReport(report);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredAnnotation, setHoveredAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const activeAnnotation = hoveredAnnotation || selectedAnnotation;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const zoomIn = () => {
    playTick?.();
    setZoom(z => Math.min(z + 0.25, 3));
  };

  const zoomOut = () => {
    playTick?.();
    setZoom(z => {
      const next = Math.max(z - 0.25, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = () => {
    playTick?.();
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHoveredAnnotation(null);
    setSelectedAnnotation(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
      {/* Interactive Window */}
      <div className="flex-1 relative bg-black/60 border border-white/[0.08] rounded-[24px] overflow-hidden min-h-[450px] flex items-center justify-center select-none shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
        
        {/* Canvas Controls */}
        <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2 bg-[#0c0c0b]/90 border border-white/[0.08] px-3 py-2 rounded-full backdrop-blur-md">
          <button 
            onClick={zoomIn} 
            className="p-2 hover:text-white text-white/50 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={zoomOut} 
            className="p-2 hover:text-white text-white/50 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            onClick={resetZoom} 
            className="p-2 hover:text-white text-white/50 transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
          <span className="text-[10px] font-mono text-white/30 px-2 border-l border-white/10 select-none">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Viewport Box */}
        <div 
          className={`w-full h-full absolute inset-0 flex items-center justify-center ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="relative transition-transform duration-75 ease-out origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: "100%",
              maxWidth: "680px"
            }}
          >
            {/* Screenshot */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshotUrl}
              alt="Dossier audit screenshot"
              draggable={false}
              className="w-full h-auto rounded-lg filter grayscale contrast-[1.03] opacity-75 hover:opacity-100 transition-opacity duration-500"
            />

            {/* Glowing Red Boundary Box Highlights */}
            {activeAnnotation && (
              <motion.div
                layoutId="boundary-box"
                className="absolute border-2 border-[#b9443f] bg-[#b9443f]/[0.03] z-20 pointer-events-none shadow-[0_0_20px_rgba(185,68,63,0.4)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  top: activeAnnotation.box.top,
                  left: activeAnnotation.box.left,
                  width: activeAnnotation.box.width,
                  height: activeAnnotation.box.height,
                }}
              />
            )}

            {/* Target dots */}
            {annotations.map((ann) => (
              <div
                key={ann.id}
                style={{ top: ann.top, left: ann.left }}
                className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
                onMouseEnter={() => {
                  playTick?.();
                  setHoveredAnnotation(ann);
                }}
                onMouseLeave={() => setHoveredAnnotation(null)}
                onClick={() => {
                  playTick?.();
                  setSelectedAnnotation(selectedAnnotation?.id === ann.id ? null : ann);
                }}
              >
                {/* Visual Targeting Dot */}
                <div className="relative group cursor-pointer">
                  <span className="absolute -inset-3 bg-transparent" />
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeAnnotation?.id === ann.id 
                      ? "bg-[#b9443f] scale-125" 
                      : "bg-[#0c0c0b] border-2 border-white/40 group-hover:border-[#b9443f] scale-100"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${activeAnnotation?.id === ann.id ? 'bg-[#ffefe3]' : 'bg-[#b9443f]/70'}`} />
                  </div>
                  
                  {/* Floating marker label */}
                  <div className={`absolute left-6 top-1/2 -translate-y-1/2 bg-[#0c0c0b]/95 border border-[#b9443f]/40 px-2 py-1 text-[9px] font-mono tracking-wider text-[#ffefe3] rounded whitespace-nowrap shadow-lg transition-all duration-300 ${
                    activeAnnotation?.id === ann.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                  }`}>
                    {ann.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side Slide Drawer Panel */}
      <div className="w-full lg:w-[320px] shrink-0 border border-white/[0.08] bg-[#0c0c0b]/40 rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#b9443f]/50" />
        
        <AnimatePresence mode="wait">
          {activeAnnotation ? (
            <motion.div
              key={activeAnnotation.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full justify-between gap-6"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                  <span className="text-[10px] font-mono tracking-widest text-[#b9443f] uppercase font-bold">
                    [ Annotation 0{activeAnnotation.id} ]
                  </span>
                  <button 
                    onClick={() => {
                      playTick?.();
                      setSelectedAnnotation(null);
                      setHoveredAnnotation(null);
                    }}
                    className="p-1 hover:text-[#b9443f] text-white/35 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <h4 className="text-[16px] font-serif text-white font-medium mb-3">
                  {activeAnnotation.details.title}
                </h4>
                
                <p className="text-[13px] font-serif text-white/50 leading-relaxed mb-5">
                  {activeAnnotation.details.critique}
                </p>

                <div className="bg-[#b9443f]/[0.02] border border-[#b9443f]/10 p-3.5 rounded-xl mb-4">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#b9443f] uppercase tracking-wider mb-2">
                    <CheckSquare size={10} />
                    Copy Recommendation
                  </div>
                  <p className="text-[12px] font-serif text-[#ffefe3]/90 italic">
                    &quot;{activeAnnotation.details.copyRecommendation}&quot;
                  </p>
                </div>

                <div className="bg-black/60 border border-white/[0.06] p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/35 uppercase tracking-wider mb-2">
                    <Code size={10} />
                    Code Blueprint
                  </div>
                  <pre className="text-[10px] font-mono text-white/70 overflow-x-auto p-1 leading-normal whitespace-pre">
                    {activeAnnotation.details.codeSnippet}
                  </pre>
                </div>
              </div>

              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                Vectors calibrated
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center py-20 h-full text-white/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#b9443f] animate-pulse mb-3" />
              <p className="text-[12px] font-mono uppercase tracking-[0.16em]">
                Select point on screenshot to open diagnostics
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
