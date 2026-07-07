import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tirbeo — Connect. Share. Belong.",
  description: "Connect with people who inspire you, share the moments that matter, and become part of communities that make the internet feel personal again.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
