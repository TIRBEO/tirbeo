import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIRBEO — Archive Collection",
  description: "A digital sanctuary for meaningful communities, real conversations, and shared experiences that transcend the noise.",
  openGraph: {
    title: "TIRBEO — Archive Collection",
    description: "A digital sanctuary for meaningful communities.",
    url: "https://tirbeo.app",
    siteName: "TIRBEO",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
