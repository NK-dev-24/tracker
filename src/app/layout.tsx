import type { Metadata } from "next";
import { DM_Sans, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "75 Hard — No Excuses. No Exceptions.",
  description:
    "The brutally simple 75-day discipline tracker. Complete every task before midnight. Miss one — start over from Day 0.",
  keywords: ["75 hard", "discipline", "habit tracker", "streak"],
  openGraph: {
    title: "75 Hard",
    description: "75 days. No excuses. No exceptions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${syne.variable} ${jbMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
