"use client";

import { headerLabel } from "@/lib/home";
import { useVehicleField } from "@/components/public/ContentProvider";

const INSIDE = ["The two-face story", "System & wiring diagrams", "Spec sheet for every component", "Photo log behind the panels"];

export function PrintQrView({ svg, display }: { svg: string; display: string }) {
  const label = headerLabel(useVehicleField("home"), useVehicleField("category"));
  const instagram = useVehicleField("instagram") ?? "";
  const installer = useVehicleField("installer") ?? "…";
  return (
    <div className="print-shell">
      <button type="button" className="print-btn" onClick={() => window.print()}>
        Print A4
      </button>
      <article className="a4" aria-label="A4 QR display">
        <div className="a4-body">
          <div className="a4-top">
            <span className="a4-word">BLACK AMATIS</span>
            <span className="a4-pill">{label}</span>
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
          <span>{instagram}</span>
          <span>INSTALLED BY {installer}</span>
        </footer>
      </article>
    </div>
  );
}
