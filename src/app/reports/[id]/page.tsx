import { createClient } from "@/lib/supabase/server";
import { IntelligenceReport } from "@/components/ui/intelligence-report";
import { notFound } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import type { Metadata } from "next";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("analyses")
    .select("url")
    .eq("id", resolvedParams.id)
    .single();

  let domain = "Report";
  if (data?.url) {
    try {
      domain = new URL(data.url).hostname.replace(/^www\./, "");
    } catch {}
  }

  return {
    title: `${domain} — Intelligence Dossier | Creative Intelligence Studio`,
    description: `Brand intelligence analysis and strategic audit for ${domain}.`,
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const supabase = await createClient();
  const resolvedParams = await params;

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <AppLayout hideHeader hideFooter>
      <IntelligenceReport
        report={data.report}
        url={data.url}
        screenshotUrl={data.report?.screenshotUrl}
        scores={data.scores}
      />
    </AppLayout>
  );
}
