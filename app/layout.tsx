import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "12th Business Convention 2026 — Registration",
  description: "Attendee registration system for Victory Men Fellowship Business Convention 2026",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
