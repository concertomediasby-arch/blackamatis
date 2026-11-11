"use client";

export function PrintButton() {
  return (
    <button type="button" className="print-btn" onClick={() => window.print()}>
      Print A4
    </button>
  );
}
