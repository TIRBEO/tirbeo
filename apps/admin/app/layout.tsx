import type { Metadata } from "next";
import { AuthProvider } from "@tirbeo/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tirbeo Admin",
  description: "Tirbeo administration panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
