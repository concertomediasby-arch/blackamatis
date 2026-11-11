import type { Metadata } from "next";
import QRCode from "qrcode";
import { PrintButton } from "./PrintButton";
import { SITE_URL } from "@/lib/supabase/env";
import { getSiteContent } from "@/lib/supabase/queries";
import "./print.css";

export const metadata: Metadata = { title: "QR display (A4)", robots: { index: false } };

const INSIDE = ["The two-face story", "System & wiring diagrams", "Spec sheet for every component", "Photo log behind the panels"];

export default async function PrintQrPage() {
  const { vehicle: v } = await getSiteContent();
  const svg = await QRCode.toString(SITE_URL, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#00000000" } });
  const display = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="print-shell">
      <PrintButton />
      <article className="a4" aria-label="A4 QR display">
        <div className="a4-body">
          <div className="a4-top">
            <span className="a4-word">BLACK AMATIS</span>
            <span className="a4-pill">EMMA 2026 · {v.category}</span>
          </div>
          <span className="a4-eyebrow">HONDA ODYSSEY · TWO-FACE CONCEPT</span>
          <h1 className="a4-title">
            SCAN TO SEE
            <br />
            WHAT&apos;S INSIDE.
          </h1>
          <div className="a4-qr-row">
            <div className="a4-qr" role="img" aria-label={`QR code: link to the website ${display}`} dangerouslySetInnerHTML={{ __html: svg }} />
            <ul className="a4-list">
              {INSIDE.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <p className="a4-ask">
            Questions about the build? <strong>Ask us — the team is right here.</strong>
          </p>
        </div>
        <footer className="a4-foot">
          <span>{display}</span>
          <span>{v.instagram}</span>
          <span>INSTALLED BY {v.installer}</span>
        </footer>
      </article>
    </div>
  );
}
