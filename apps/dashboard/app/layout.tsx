import type { Metadata } from "next";
import { AuthProvider } from "@tirbeo/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Account — Tirbeo",
  description: "Manage your Tirbeo account",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
