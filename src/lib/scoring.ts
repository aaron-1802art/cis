export interface ScoreItem {
  label: string;
  score: number;
}

export function calculateEmpiricalScores(markdown: string, url: string): ScoreItem[] {
  const text = markdown || "";
  const len = text.length;

  // 1. Brand Strength (based on density of unique words and brand patterns)
  let brandStrength = 75;
  if (len > 1500) brandStrength += 6;
  if (len > 6000) brandStrength += 6;
  if (/\b(we|our|us|brand|founded|mission|identity|heritage|craft|legacy|manifesto)\b/i.test(text)) brandStrength += 6;
  if (text.match(/#[a-zA-Z0-9_-]+/g)) brandStrength += 4;
  brandStrength = Math.min(99, Math.max(60, brandStrength));

  // 2. Trust (reviews, SSL, policy links, credentials)
  let trust = 70;
  if (/\b(trust|secure|privacy|terms|policy|copyright|all rights reserved|©)\b/i.test(text)) trust += 10;
  if (/\b(review|testimonial|rating|star|rated|customer|guarantee|refund|satisfaction|certified|trusted)\b/i.test(text)) trust += 10;
  if (url.startsWith("https://")) trust += 5;
  trust = Math.min(99, Math.max(60, trust));

  // 3. Messaging (poetic brevity, high-value vocabulary)
  let messaging = 72;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 100 && wordCount < 1800) messaging += 15; // sweet spot for elegant pages
  else if (wordCount >= 1800) messaging += 5; // long/bloated copy
  if (/\b(you|your|imagine|transform|discover|create|experience|curate|elevate|world-class)\b/i.test(text)) messaging += 8;
  messaging = Math.min(99, Math.max(60, messaging));

  // 4. UX (headings, list items, structured layout)
  let ux = 68;
  const h1Count = (text.match(/^#\s+/gm) || []).length;
  const h2Count = (text.match(/^##\s+/gm) || []).length;
  const bulletCount = (text.match(/^[-*+]\s+/gm) || []).length;
  if (h1Count >= 1) ux += 5;
  if (h2Count >= 2) ux += 8;
  if (bulletCount >= 3) ux += 8;
  if (len > 2500) ux += 5;
  ux = Math.min(99, Math.max(60, ux));

  // 5. Conversion (calls to action, pricing, checkouts)
  let conversion = 65;
  const ctaMatches = text.match(/\b(buy|shop|get|start|subscribe|purchase|join|add to cart|checkout|pricing|register|sign up)\b/gi) || [];
  if (ctaMatches.length >= 1) conversion += 10;
  if (ctaMatches.length >= 4) conversion += 10;
  if (/\b(free|save|off|discount|now)\b/i.test(text)) conversion += 8;
  conversion = Math.min(99, Math.max(60, conversion));

  // 6. Differentiation (competition markers, proprietary claims, VS comparisons)
  let differentiation = 70;
  if (/\b(vs|versus|compare|unlike|why choose|different|unique|patented|innovative|proprietary|engineered|reimagined)\b/i.test(text)) differentiation += 15;
  if (len > 3500) differentiation += 5;
  differentiation = Math.min(99, Math.max(60, differentiation));

  return [
    { label: "Brand Strength", score: brandStrength },
    { label: "Trust", score: trust },
    { label: "Messaging", score: messaging },
    { label: "UX", score: ux },
    { label: "Conversion", score: conversion },
    { label: "Differentiation", score: differentiation }
  ];
}
