import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "75 HARD — No Excuses. No Exceptions.",
  description:
    "The brutally simple 75-day discipline tracker. Complete every task, every day, before midnight. Miss one — start over.",
  keywords: ["75 hard", "discipline", "habit tracker", "productivity"],
  openGraph: {
    title: "75 HARD",
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
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
