import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { url, report, screenshotUrl, scores } = await req.json();

    if (!url || !report) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    const summary = report?.data?.executiveSummary || "";

    const { data: insertedData, error: dbError } = await supabase
      .from("analyses")
      .insert({
        url,
        report: { ...report, screenshotUrl },
        summary,
        screenshot_url: screenshotUrl,
        user_id: user?.id || null,
        scores: scores || [],
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[save-route] Supabase insert error:", JSON.stringify(dbError));
      throw dbError;
    }

    return NextResponse.json({ success: true, id: insertedData.id });
  } catch (error: any) {
    console.error("[save-route] Save Error:", error.message || error);
    return NextResponse.json({ error: `Failed to save report: ${error.message}` }, { status: 500 });
  }
}

