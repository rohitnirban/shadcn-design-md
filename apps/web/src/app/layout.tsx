import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/context/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "shadcn DESIGN.md | Export any preset",
  description:
    "Chrome extension that exports any shadcn preset on ui.shadcn.com/create as a portable DESIGN.md, raw decoded JSON, or resolved globals.css.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-primary bg-background text-foreground h-full [--pattern-fg:var(--color-charcoal-900)]/10 dark:[--pattern-fg:var(--color-neutral-100)]/30">
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
