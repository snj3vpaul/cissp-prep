import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OutlineBanner } from "@/components/outline-banner";
import { SITE } from "@/lib/utils";
import { BadgeToaster } from "@/components/badge-toaster";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Free CISSP Exam Prep`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  keywords: ["CISSP", "ISC2", "CISSP practice questions", "CISSP flashcards", "CAT exam simulator", "security certification"],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Free CISSP Exam Prep`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0E1A" },
    { media: "(prefers-color-scheme: light)", color: "#F7F8FC" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <OutlineBanner />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <BadgeToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
