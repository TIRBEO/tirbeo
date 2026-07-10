import type { Metadata } from "next";
import "./globals.css";
import { ThemeInit } from "./components";

export const metadata: Metadata = {
  title: "Dashboard — Tirbeo",
  description: "Manage your Tirbeo account",
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
