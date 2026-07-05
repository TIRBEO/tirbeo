import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support — Tirbeo",
  description: "Tirbeo support and contact",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
