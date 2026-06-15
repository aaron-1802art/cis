import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { ReportSchema, detectPlatform, PlatformType } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { calculateEmpiricalScores } from "@/lib/scoring";

export const maxDuration = 60;

function getSystemPrompt(platform: PlatformType): string {
  const baseStructure = `You are a world-class brand strategist and intelligence officer deconstructing a website's digital presence based strictly on the provided context. You must reply strictly in valid JSON format.
DO NOT wrap the response in markdown blocks like \`\`\`json. Just return the raw JSON object.

CRITICAL TONE & COPYWRITING INSTRUCTION:
Write like an elite editorial critic for a luxury publication (e.g., Saint Laurent, A24, Apple Keynotes, Stripe Press). 
Avoid corporate SaaS jargon ("optimize conversions," "user-friendly," "call-to-action," "leverage"). 
Use poetic, high-fashion, and philosophical observation structures. 

For example:
"OBSERVATION 001
Apple sells aspiration before information.
The homepage is engineered to create desire within 3 seconds.
Technical understanding comes later.
The result:
exceptional emotional engagement,
limited educational depth."

Apply this poetic formatting (using raw line breaks \n where appropriate) to create highly evocative, diagnostic, and critique-heavy observations. All detailed findings and summaries must prove deep analysis of specific copy, imagery descriptions, or structures mentioned in the website context.`;

  const jsonStructure = `Your JSON must match this exact structure:
{
  "executiveSummary": "string (A beautiful, poetic critique summarizing the core tension/philosophy of the website's layout and messaging)",
  "analystNote": "string (A raw, personal, highly critical strategist observation about the brand's main psychological tradeoff, formatted with line breaks \\n, e.g. 'Apple intentionally hides complexity.\\n\\nThe experience feels effortless,\\nbut this simplicity comes at the cost\\nof product education.')",
  "confidenceScore": number (1-100),
  "potentialOpportunity": "string (e.g., 'Aspirational dominance' or 'Tactile clarity')",
  "biggestOpportunity": {
    "whatShouldChange": "string (Short, evocative editorial critique title)",
    "whyItMatters": "string (Poetic explanation of the psychological friction)",
    "expectedImpact": "string (The aesthetic/business evolution)"
  },
  "biggestRisk": {
    "whatIsHurtingPerformance": "string (A punchy statement on what ruins the aesthetic/hierarchy)",
    "businessConsequences": "string (The resulting erosion of brand equity)"
  },
  "actionPlan": [
    {
      "recommendation": "string (Evocative strategic action)",
      "expectedLift": "string (e.g., +20% desire)",
      "difficulty": "string (e.g., Low, Medium, High)",
      "timeline": "string (e.g., Immediate)",
      "businessImpact": "string"
    }
  ],
  "evidence": [
    "string (Highly specific evidence, e.g., 'The hero section hides the pricing under a heavy script font.')"
  ],
  "detailedFindings": [
    {
      "category": "string (Must be one of: Visual Hierarchy, Conversion, Trust, Performance, Copywriting, Navigation)",
      "observation": "string (Write as: 'Observation [num]\n\n[Observation title]\n\n[Explanation]\n\nThe result:\n[effect]')",
      "evidence": "string (Specific raw copy/imagery referenced from the site)",
      "recommendation": "string (Tactical blueprint)"
    }
  ]
}`;

  return `You extract deep intelligence from a Website URL. You evaluate UX, Conversion Optimization, Visual Hierarchy, and Trust.
${baseStructure}
${jsonStructure}
Ensure your tone is that of a premium, highly paid strategic consultant handing over a dossier.`;
}

export async function POST(req: Request) {
  try {
    // ── Step 1: Auth ──
    console.log("[analyze] Step 1: Checking authentication...");
    let user = null;
    try {
      const supabase = await createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn("[analyze] Auth error (non-blocking):", authError.message);
      } else {
        user = authData.user;
        console.log("[analyze] Authenticated user:", user?.id || "none (anonymous)");
      }
    } catch (authErr: any) {
      console.warn("[analyze] Auth check failed (non-blocking):", authErr.message);
    }

    // ── Step 2: Validate URL ──
    const { url } = await req.json();
    console.log("[analyze] Step 2: URL submitted:", url);

    const urlValidation = z.string().url().safeParse(url);
    if (!urlValidation.success) {
      return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
    }

    const platform = detectPlatform(url);
    console.log("[analyze] Detected platform:", platform);

    // ── Step 3: Scrape with Firecrawl ──
    console.log("[analyze] Step 3: Scraping with Firecrawl...");
    let markdownContent = "";
    let screenshotUrl = "";
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY || "";
      if (!apiKey) {
        console.warn("[analyze] FIRECRAWL_API_KEY is not set. Skipping scrape.");
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // Reduce timeout to 12s

        const firecrawlRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({ url, formats: ["markdown", "screenshot"] }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const scrapeResult = await firecrawlRes.json();

        if (firecrawlRes.ok && scrapeResult.success) {
          markdownContent = scrapeResult.data?.markdown || "";
          screenshotUrl = scrapeResult.data?.screenshot || "";
          console.log("[analyze] Firecrawl success. Markdown length:", markdownContent.length, "Screenshot:", screenshotUrl ? "yes" : "no");
        } else {
          console.warn("[analyze] Firecrawl returned non-success:", JSON.stringify(scrapeResult).substring(0, 200));
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
         console.warn("[analyze] Firecrawl timed out after 12s. Falling back to URL only.");
      } else {
         console.warn("[analyze] Firecrawl error (non-blocking):", error.message);
      }
    }

    // ── Calculate Empirical Scores ──
    const empiricalScores = calculateEmpiricalScores(markdownContent, url);

    // ── Step 4: Generate report with Groq (with retry) ──
    console.log("[analyze] Step 4: Generating report with Groq...");
    let reportData = null;
    try {
      let groqKey = process.env.GROQ_API_KEY || "";
      // Sanitize key in case it was incorrectly set in the environment (e.g. prefix or duplicated)
      groqKey = groqKey.replace("GROQ_API_KEY=", "").trim();
      if (groqKey.includes(" ")) groqKey = groqKey.split(" ")[0];

      console.log("[analyze] GROQ_API_KEY loaded:", groqKey ? "yes" : "NO - MISSING!");
      if (!groqKey) {
        return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
      }
      const groq = new Groq({ apiKey: groqKey, timeout: 25000 }); // Reduce timeout to 25s

      const systemPrompt = getSystemPrompt(platform);
      // Slice markdown to 4000 chars max to ensure Groq is extremely fast
      const safeMarkdown = markdownContent ? markdownContent.substring(0, 4000) : "";
      const userPrompt = `URL to analyze: ${url}\n\nExtracted Context (if any):\n${safeMarkdown}`;

      // Retry logic with exponential backoff
      const MAX_RETRIES = 3;
      let lastError: any = null;
      let completion = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`[analyze] Groq attempt ${attempt}/${MAX_RETRIES}...`);
          completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
          });
          lastError = null;
          break; // Success, exit retry loop
        } catch (retryErr: any) {
          lastError = retryErr;
          console.warn(`[analyze] Groq attempt ${attempt} failed:`, retryErr.message);
          if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 500; // 1s, 2s backoff
            console.log(`[analyze] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (lastError || !completion) {
        const errMsg = lastError?.message || "Unknown error";
        // Provide user-friendly error messages
        if (errMsg.includes("Connection error") || errMsg.includes("fetch failed") || errMsg.includes("ECONNREFUSED")) {
          throw new Error("Could not connect to Groq API. Please check your internet connection and try again.");
        } else if (errMsg.includes("401") || errMsg.includes("Unauthorized") || errMsg.includes("invalid_api_key")) {
          throw new Error("Groq API key is invalid or expired. Please update GROQ_API_KEY in .env.local.");
        } else if (errMsg.includes("429") || errMsg.includes("rate_limit")) {
          throw new Error("Groq API rate limit reached. Please wait a minute and try again.");
        }
        throw new Error(errMsg);
      }

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Groq returned empty response");
      }

      console.log("[analyze] Groq raw response length:", content.length);
      const rawData = JSON.parse(content);
      reportData = ReportSchema.parse({ platform, data: rawData });
      console.log("[analyze] Report parsed successfully.");

    } catch (error: any) {
      console.error("[analyze] Groq/Parse Error:", error.message);
      return NextResponse.json({
        error: `Report generation failed: ${error.message}`,
      }, { status: 500 });
    }

    // ── Step 5: Save to Supabase (fail-open — NEVER blocks the user) ──
    console.log("[analyze] Step 5: Attempting database save...");
    let reportId = null;
    let dbErrorMessage = null;
    try {
      const supabase = await createClient();
      const summary = reportData?.data?.executiveSummary || "";

      const insertPayload = {
        url,
        report: { ...reportData, screenshotUrl },
        scores: empiricalScores,
        summary,
        screenshot_url: screenshotUrl,
        user_id: user?.id || null,
      };
      console.log("[analyze] Insert payload keys:", Object.keys(insertPayload));
      console.log("[analyze] user_id:", insertPayload.user_id);

      const { data: insertedData, error: dbError } = await supabase
        .from("analyses")
        .insert(insertPayload)
        .select("id")
        .single();

      if (dbError) {
        console.error("[analyze] Supabase insert error:", JSON.stringify(dbError));
        dbErrorMessage = dbError.message;
      } else if (insertedData) {
        reportId = insertedData.id;
        console.log("[analyze] Report saved with ID:", reportId);
      }
    } catch (dbErr: any) {
      console.error("[analyze] Database exception:", dbErr.message);
      dbErrorMessage = dbErr.message;
    }

    // ── Step 6: Return response ──
    // ALWAYS return the report, even if database save failed
    console.log("[analyze] Step 6: Returning response. reportId:", reportId, "dbError:", dbErrorMessage);
    return NextResponse.json({
      success: true,
      report: reportData,
      screenshotUrl,
      reportId,
      scores: empiricalScores,
      dbError: dbErrorMessage,
    });

  } catch (error: any) {
    console.error("[analyze] Unhandled error:", error.message, error.stack);
    return NextResponse.json({
      error: `Internal Server Error: ${error.message}`,
    }, { status: 500 });
  }
}
