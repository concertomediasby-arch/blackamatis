"use client";

/** Building blocks for circuit views: status labels, cable labels and a power/ground run. */

import { useState } from "react";
import type { AnalysedItem } from "@/lib/emma/chain";

export const STATUS = {
  ok: { text: "✓ Fuses match VW75212", cls: "border-lemon/50 bg-lemon/10 text-lemon" },
  over: { text: "⚠ A cable is thinner than its fuse allows", cls: "border-[#FF8A65] bg-[#FF8A65]/10 text-[#FFB199]" },
  incomplete: { text: "Some cable sizes or fuse ratings are not filled in yet", cls: "border-white/25 bg-white/5 text-muted" },
  empty: { text: "No fused cables in this run", cls: "border-white/25 bg-white/5 text-muted" },
} as const;

export const lengthLabel = (cm: number | null | undefined) => (cm == null ? "[__ cm]" : cm >= 100 ? `${Math.round(cm) / 100} m` : `${cm} cm`);
export const awgLabel = (awg: string | null | undefined) => (awg ? `${awg} AWG` : "[__ AWG]");

function CableLine({ it }: { it: Extract<AnalysedItem, { t: "cable" }> }) {
  const c = it.check;
  // Placeholders only where the check needs the value (fused power cables); ground shows what is known.
  const checked = c && c.kind !== "none";
  const parts = checked
    ? [it.name, awgLabel(it.awg), lengthLabel(it.length_cm)]
    : [it.name, it.awg ? awgLabel(it.awg) : null, it.length_cm != null ? lengthLabel(it.length_cm) : null];
  const text = parts.filter(Boolean).join(" · ");
  return (
    <div className="ml-[5px] flex flex-col gap-0.5 border-l-2 border-amber/50 py-1.5 pl-4">
      <span className="text-[12px] text-ink">{text || <span className="text-muted">Cable</span>}</span>
      {c?.kind === "distance" && (
        <span className={`font-mono text-[11px] ${c.ok === false ? "text-[#FFB199]" : c.ok ? "text-lemon" : "text-muted"}`}>
          {c.ok === false ? "⚠" : c.ok ? "✓" : ""} to the first fuse · max {c.maxCm} cm from the + post
        </span>
      )}
      {c?.kind === "fuse" && (
        <span className={`font-mono text-[11px] ${c.ok === false ? "text-[#FFB199]" : c.ok ? "text-lemon" : "text-muted"}`}>
          {c.ok === false
            ? `⚠ on a ${c.fuseA} A fuse · this cable allows max ${c.maxA} A`
            : c.ok
              ? `✓ ${c.fuseA} A fuse · max ${c.maxA} A`
              : c.fuseA === null
                ? `Fuse rating needed for the check${c.maxA != null ? ` · this cable allows max ${c.maxA} A` : ""}`
                : `${c.fuseA} A fuse · cable size needed for the check`}
        </span>
      )}
    </div>
  );
}

function Node({ label, fuse, isFuse, strong }: { label: string; fuse?: number | null; isFuse?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className={`mt-1 h-3 w-3 flex-none rounded-full ${strong ? "bg-amber" : "border-2 border-amber"}`} />
      <span className={`text-[14px] ${strong ? "font-bold" : ""}`}>
        {label}
        {(fuse != null || isFuse) && <span className="ml-2 rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[11px] text-amber">FUSE {fuse != null ? `${fuse} A` : "[__ A]"}</span>}
      </span>
    </div>
  );
}

/** A power or ground run; the shared part from the battery folds into one line. */
export function Run({ title, items, shared, sharedName }: { title: string; items: AnalysedItem[]; shared: number; sharedName?: string }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const folded = shared > 0 && !open;
  const visible = folded ? items.slice(shared) : items;
  const lastShared = items[shared - 1];
  const sharedHasIssue = items.slice(0, shared).some((i) => i.t === "cable" && i.check && "ok" in i.check && i.check.ok === false);
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.14em] text-muted-2">{title}</span>
      <ol className="m-0 flex list-none flex-col p-0">
        {folded && (
          <li className="flex flex-col">
            <button type="button" onClick={() => setOpen(true)} className="flex min-h-11 cursor-pointer items-start gap-3 text-left hover:text-lemon">
              <span aria-hidden="true" className="mt-1 h-3 w-3 flex-none rounded-full border-2 border-dashed border-amber" />
              <span className="flex flex-col">
                <span className="text-[13px]">
                  From the battery via {sharedName ?? "the main run"}
                  {sharedHasIssue && <span className="text-[#FFB199]"> · ⚠</span>}
                </span>
                <span className="text-[11px] text-amber">Show the full path ▾</span>
              </span>
            </button>
            {lastShared?.t === "node" && <Node label={lastShared.label} fuse={lastShared.fuse_a} isFuse={lastShared.is_fuse} />}
          </li>
        )}
        {visible.map((it, i) => {
          const last = (folded ? shared : 0) + i === items.length - 1;
          return <li key={it.id}>{it.t === "node" ? <Node label={it.label} fuse={it.fuse_a} isFuse={it.is_fuse} strong={last} /> : <CableLine it={it} />}</li>;
        })}
      </ol>
    </div>
  );
}
