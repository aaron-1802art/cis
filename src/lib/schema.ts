import { z } from "zod";

export type PlatformType = "youtube" | "instagram" | "twitter" | "ecommerce" | "website";

export function detectPlatform(url: string): PlatformType {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube";
    if (hostname.includes("instagram.com")) return "instagram";
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "twitter";
    if (hostname.includes("amazon.com") || hostname.includes("shopify") || url.includes("/products/") || url.includes("/product/")) return "ecommerce";
    return "website"; // default
  } catch {
    return "website";
  }
}

// ----------------------------------------------------------------------
// EXECUTIVE BRIEFING SCHEMA
// ----------------------------------------------------------------------

export const OpportunitySchema = z.object({
  whatShouldChange: z.string().catch(""),
  whyItMatters: z.string().catch(""),
  expectedImpact: z.string().catch("")
});

export const RiskSchema = z.object({
  whatIsHurtingPerformance: z.string().catch(""),
  businessConsequences: z.string().catch("")
});

export const ActionPlanItemSchema = z.object({
  recommendation: z.string().catch(""),
  expectedLift: z.string().catch(""),
  difficulty: z.string().catch(""),
  timeline: z.string().catch(""),
  businessImpact: z.string().catch("")
});

export const DetailedFindingSchema = z.object({
  category: z.string().catch("Visual Hierarchy"),
  observation: z.string().catch(""),
  evidence: z.string().catch(""),
  recommendation: z.string().catch("")
});

export const ExecutiveBriefingSchema = z.object({
  executiveSummary: z.string().catch(""),
  analystNote: z.string().optional(),
  confidenceScore: z.number().catch(85),
  potentialOpportunity: z.string().catch(""),
  biggestOpportunity: OpportunitySchema,
  biggestRisk: RiskSchema,
  actionPlan: z.array(ActionPlanItemSchema).catch([]),
  evidence: z.array(z.string()).catch([]),
  detailedFindings: z.array(DetailedFindingSchema).catch([])
});

// Since the platform still exists in the API, we can just wrap the new schema for all platforms
// or use a unified report schema. We'll keep the discriminated union so the API doesn't break conceptually.
export const ReportSchema = z.discriminatedUnion("platform", [
  z.object({ platform: z.literal("youtube"), data: ExecutiveBriefingSchema }),
  z.object({ platform: z.literal("instagram"), data: ExecutiveBriefingSchema }),
  z.object({ platform: z.literal("twitter"), data: ExecutiveBriefingSchema }),
  z.object({ platform: z.literal("ecommerce"), data: ExecutiveBriefingSchema }),
  z.object({ platform: z.literal("website"), data: ExecutiveBriefingSchema }),
]);

export type BrandIntelligenceReport = z.infer<typeof ReportSchema>;
export type ExecutiveBriefingData = z.infer<typeof ExecutiveBriefingSchema>;
export type OpportunityData = z.infer<typeof OpportunitySchema>;
export type RiskData = z.infer<typeof RiskSchema>;
export type ActionPlanItemData = z.infer<typeof ActionPlanItemSchema>;
export type DetailedFindingData = z.infer<typeof DetailedFindingSchema>;

