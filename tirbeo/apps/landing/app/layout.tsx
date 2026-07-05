import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tirbeo — Social Media for Nepal",
  description: "A production-grade social media ecosystem built for Nepal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        suppressHydrationWarning
        className={`${inter.className} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}