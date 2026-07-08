import type { Metadata } from "next";
import { SmoothScroll } from "../components/SmoothScroll";
import { CustomCursor } from "../components/CustomCursor";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Tirbeo — Connect. Share. Belong.",
  icons: { icon: "/logo1.png" },
  description:
    "Connect with people who inspire you, share the moments that matter, and become part of communities that make the internet feel personal again.",
  keywords: [
    "Tirbeo", "social platform", "community", "messaging", "real-time chat",
  ],
  openGraph: {
    title: "Tirbeo — Connect. Share. Belong.",
    description: "Connect with people who inspire you and communities that matter.",
    url: "https://tirbeo.app",
    siteName: "Tirbeo",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tirbeo — Connect. Share. Belong.",
    description: "Connect with people who inspire you and communities that matter.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/bgpc.png" fetchPriority="high" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <CustomCursor />
        <SmoothScroll>{children}</SmoothScroll>
        <SpeedInsights />
      </body>
    </html>
  );
}
