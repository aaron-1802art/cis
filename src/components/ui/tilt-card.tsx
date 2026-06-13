"use client";

import { useRef, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt angle in degrees (default 6) */
  maxTilt?: number;
  /** Scale on hover (default 1.01) */
  hoverScale?: number;
  /** Whether to show glare effect (default true) */
  glare?: boolean;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  hoverScale = 1.01,
  glare = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      // Cancel previous RAF to avoid queueing
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (inverted for natural 3D feel)
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${hoverScale}, ${hoverScale}, ${hoverScale})`;

        // Update glare position via CSS custom props
        const glareX = ((x / rect.width) * 100).toFixed(1);
        const glareY = ((y / rect.height) * 100).toFixed(1);
        card.style.setProperty("--glare-x", `${glareX}%`);
        card.style.setProperty("--glare-y", `${glareY}%`);
      });
    },
    [maxTilt, hoverScale]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Smooth reset
    card.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";

    setTimeout(() => {
      if (card) card.style.transition = "transform 0.1s ease-out";
    }, 500);
  }, []);

  const handleMouseEnter = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 0.1s ease-out";
  }, []);

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {children}
      {glare && <div className="tilt-card-glare" />}
    </div>
  );
}
