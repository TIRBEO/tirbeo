import type { Metadata } from "next";
import { AuthProvider } from "@tirbeo/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tirbeo",
  description: "Connect with your community",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ne">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
