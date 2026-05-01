import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/context/theme-provider";
import { SITE_URL } from "@/lib/site-url";

const GOOGLE_ADS_ID = "AW-18070427821";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "shadcn DESIGN.md | Export any preset",
    template: "%s",
  },
  description:
    "Chrome extension that exports any shadcn preset on ui.shadcn.com/create as a portable DESIGN.md, raw decoded JSON, or resolved globals.css.",
  applicationName: "shadcn DESIGN.md",
  authors: [{ name: "Rohit Yadav", url: "https://github.com/rohitnirban" }],
  creator: "Rohit Yadav",
  keywords: [
    "shadcn",
    "shadcn/ui",
    "design.md",
    "DESIGN.md",
    "Chrome extension",
    "design tokens",
    "OKLCH",
    "Tailwind CSS",
    "theme export",
    "AI coding agents",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "shadcn DESIGN.md",
    title: "shadcn DESIGN.md | Export any preset",
    description:
      "Export any shadcn preset as DESIGN.md, raw JSON, or globals.css. Matches shadcn apply byte-for-byte.",
  },
  twitter: {
    card: "summary_large_image",
    title: "shadcn DESIGN.md | Export any preset",
    description:
      "Export any shadcn preset as DESIGN.md, raw JSON, or globals.css.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "iEMFXgPc433CS1lqsEYH5KvQv_nzFYFdnsAGcf1j6YE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-primary bg-background text-foreground h-full [--pattern-fg:var(--color-charcoal-900)]/10 dark:[--pattern-fg:var(--color-neutral-100)]/30">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system">
          <main className="bg-background h-full antialiased">
            <Navbar />
            {children}
            <Footer />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
