import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ScrollProvider } from "@/components/layout/scroll-provider";
import { DotMatrixBackground } from "@/components/ui/dot-matrix-bg";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Creative Intelligence Studio",
    template: "%s | Creative Intelligence Studio",
  },
  description:
    "AI-powered website audits — analyze positioning, messaging, UX, trust, and growth opportunities for any brand.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Creative Intelligence Studio",
    description:
      "AI-powered website audits — analyze positioning, messaging, UX, trust, and growth opportunities for any brand.",
    type: "website",
    siteName: "Creative Intelligence Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Intelligence Studio",
    description:
      "AI-powered website audits — analyze positioning, messaging, UX, trust, and growth opportunities for any brand.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} dark`}>
      <body className="antialiased selection:bg-white/10 selection:text-white relative">
        <DotMatrixBackground />
        <ScrollProvider>
          {children}
        </ScrollProvider>
      </body>
    </html>
  );
}
