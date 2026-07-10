import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components";

export const metadata: Metadata = {
  title: "Dashboard — Tirbeo",
  description: "Manage your Tirbeo account",
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
