import type { Metadata } from "next";
import { Alexandria, JetBrains_Mono } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const ar = Alexandria({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-ar", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: `${BRAND.name} | ${BRAND.tagline}`,
  description: "نظام محاسبة سحابي للشركات في الأردن",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${ar.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
