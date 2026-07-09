import type { Metadata } from "next";
import { AuthProvider } from "@tirbeo/auth";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sign In — Tirbeo",
  description: "Sign in to your Tirbeo account",
};

export default function AccountsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
