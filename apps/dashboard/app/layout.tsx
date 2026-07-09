import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard — Tirbeo",
  description: "Manage your Tirbeo account and settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise-overlay">{children}</body>
    </html>
  );
}
