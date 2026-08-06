import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "12th Business Convention 2026 — Registration",
  description: "Attendee registration system for Victory Men Fellowship Business Convention 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
