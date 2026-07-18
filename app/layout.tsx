import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FANVERSE AI - Your Personal FIFA Stadium Intelligence Agent",
  description:
    "AI-powered stadium navigation for FIFA World Cup 2026. Real-time crowd intelligence, personalized guidance, and proactive notifications powered by Google Gemini AI.",
  keywords:
    "FIFA, World Cup 2026, Stadium AI, Navigation, Fan Experience, Google Gemini, Stadium Intelligence, AI Agent",
  openGraph: {
    title: "FANVERSE AI - Your Personal FIFA Stadium Intelligence Agent",
    description:
      "AI-powered stadium navigation for FIFA World Cup 2026. Real-time crowd intelligence, personalized guidance, and proactive notifications.",
    type: "website",
    siteName: "FANVERSE AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "FANVERSE AI - FIFA Stadium Intelligence Agent",
    description:
      "AI-powered stadium navigation for FIFA World Cup 2026. Powered by Google Gemini AI.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-[#0A0E27] text-white antialiased min-h-screen overflow-x-hidden font-[family-name:var(--font-inter)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-cyan-500 focus:text-[#0A0E27] focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
