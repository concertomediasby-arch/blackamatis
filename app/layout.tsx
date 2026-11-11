import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/supabase/env";
import "./globals.css";

/**
 * Fonts are self-hosted from @fontsource (OFL-1.1) so builds never depend on
 * downloading from Google Fonts at build time.
 */
const bigShoulders = localFont({
  src: "../node_modules/@fontsource-variable/big-shoulders/files/big-shoulders-latin-wght-normal.woff2",
  variable: "--font-big-shoulders",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
});
const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});
const jetbrains = localFont({
  src: "../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

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
