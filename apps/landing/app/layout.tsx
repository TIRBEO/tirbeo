import type { Metadata } from "next";
import { SmoothScroll } from "../components/SmoothScroll";
import { CustomCursor } from "../components/CustomCursor";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getLandingConfig } from "../lib/config";
import { LandingConfigProvider } from "../lib/LandingConfigContext";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getLandingConfig();
  const seo = config.seo || {};
  return {
    title: seo.title || "Tirbeo — Connect. Share. Belong.",
    icons: { icon: seo.favicon || "/logo1.png" },
    description: seo.description || "Connect with people who inspire you, share the moments that matter, and become part of communities that make the internet feel personal again.",
    keywords: seo.keywords?.length ? seo.keywords : [
      "Tirbeo", "social platform", "community", "messaging", "real-time chat",
    ],
    openGraph: {
      title: seo.title || "Tirbeo — Connect. Share. Belong.",
      description: seo.description || "Connect with people who inspire you and communities that matter.",
      url: "https://tirbeo.app",
      siteName: "Tirbeo",
      locale: "en_US",
      type: "website",
      ...(seo.ogImage && { images: [{ url: seo.ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title || "Tirbeo — Connect. Share. Belong.",
      description: seo.description || "Connect with people who inspire you and communities that matter.",
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getLandingConfig();
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <CustomCursor />
        <LandingConfigProvider config={config}>
          <SmoothScroll>{children}</SmoothScroll>
        </LandingConfigProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
