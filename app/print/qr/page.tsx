import type { Metadata } from "next";
import QRCode from "qrcode";
import { ContentProvider } from "@/components/public/ContentProvider";
import { SITE_URL } from "@/lib/supabase/env";
import { PrintQrView } from "./PrintQrView";
import "./print.css";

export const metadata: Metadata = { title: "QR display (A4)", robots: { index: false } };

/** The QR is generated at build time from NEXT_PUBLIC_SITE_URL: rebuild after changing the domain. */
export default async function PrintQrPage() {
  const svg = await QRCode.toString(SITE_URL, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#00000000" } });
  const display = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <ContentProvider>
      <PrintQrView svg={svg} display={display} />
    </ContentProvider>
  );
}
