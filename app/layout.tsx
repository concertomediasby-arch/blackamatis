import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Inter, JetBrains_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/supabase/env";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  adjustFontFallback: false,
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Black Amatis · EMMA 2026", template: "%s · Black Amatis" },
  description:
    "Black Amatis: a two-face Honda Odyssey car-audio build competing in EMMA 2026. System, wiring, evidence and story.",
  openGraph: {
    type: "website",
    siteName: "Black Amatis",
    title: "Black Amatis · EMMA 2026",
    description: "One car. Two faces. A Honda Odyssey car-audio build for EMMA 2026.",
  },
};

export const viewport: Viewport = { themeColor: "#000231", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
