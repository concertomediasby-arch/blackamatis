"use client";

import { forwardRef, useState } from "react";
import { analyseChain, chainStatus, type AnalysedItem } from "@/lib/emma/chain";
import type { AudioComponent, Circuit, SideCable } from "@/lib/types";

export const RUN_W = 400;
export const RUN_H = 600;

const STATUS = {
  ok: { text: "✓ Fuses match VW75212", cls: "border-lemon/50 bg-lemon/10 text-lemon" },
  over: { text: "⚠ A cable is thinner than its fuse allows", cls: "border-[#FF8A65] bg-[#FF8A65]/10 text-[#FFB199]" },
  incomplete: { text: "Some cable sizes are not filled in yet", cls: "border-white/25 bg-white/5 text-muted" },
  empty: { text: "No fused cables in this run", cls: "border-white/25 bg-white/5 text-muted" },
} as const;

export const lengthLabel = (cm: number | null | undefined) => (cm == null ? "[__ cm]" : cm >= 100 ? `${Math.round(cm) / 100} m` : `${cm} cm`);
export const awgLabel = (awg: string | null | undefined) => (awg ? `${awg} AWG` : "[__ AWG]");

function CableLine({ it }: { it: Extract<AnalysedItem, { t: "cable" }> }) {
  const c = it.check;
  return (
    <div className="ml-[5px] flex flex-col gap-0.5 border-l-2 border-amber/50 py-1.5 pl-4">
      <span className="text-[12px] text-ink">{[it.name, awgLabel(it.awg), lengthLabel(it.length_cm)].filter(Boolean).join(" · ")}</span>
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
              : `${c.fuseA} A fuse · cable size needed for the check`}
        </span>
      )}
    </div>
  );
}

function Node({ label, fuse, strong }: { label: string; fuse?: number | null; strong?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className={`mt-1 h-3 w-3 flex-none rounded-full ${strong ? "bg-amber" : "border-2 border-amber"}`} />
      <span className={`text-[14px] ${strong ? "font-bold" : ""}`}>
        {label}
        {fuse != null && <span className="ml-2 rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[11px] text-amber">FUSE {fuse} A</span>}
      </span>
    </div>
  );
}

/** A power or ground run; the shared part from the battery folds into one line. */
function Run({ title, items, shared, sharedName }: { title: string; items: AnalysedItem[]; shared: number; sharedName?: string }) {
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
            {lastShared?.t === "node" && <Node label={lastShared.label} fuse={lastShared.fuse_a} />}
          </li>
        )}
        {visible.map((it, i) => {
          if (folded && i === 0 && it.t === "node") return null;
          const last = (folded ? shared : 0) + i === items.length - 1;
          return <li key={it.id}>{it.t === "node" ? <Node label={it.label} fuse={it.fuse_a} strong={last} /> : <CableLine it={it} />}</li>;
        })}
      </ol>
    </div>
  );
}

function Cables({ title, list }: { title: string; list: SideCable[] }) {
  if (list.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.14em] text-muted-2">{title}</span>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {list.map((c) => (
          <li key={c.id} className="flex flex-col border-b border-white/10 pb-1.5">
            <span className="text-[13px]">
              {c.from} → {c.to}
            </span>
            <span className="text-[12px] text-muted">{[c.name, c.awg ? awgLabel(c.awg) : null, lengthLabel(c.length_cm)].filter(Boolean).join(" · ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  id: string;
  circuit: Circuit;
  circuits: Circuit[];
  components: AudioComponent[];
  style: React.CSSProperties;
  inline?: boolean;
  onClose: () => void;
  onShowSpecs?: () => void;
};

/**
 * One run on the cable diagram: power (+) from the battery through every fuse
 * to the device, ground (−), signal and speaker cables. Each fused cable is
 * checked against VW75212; cables before the first fuse against the 40 cm rule.
 */
export const RunCard = forwardRef<HTMLDivElement, Props>(function RunCard({ id, circuit: c, circuits, components, style, inline = false, onClose, onShowSpecs }, ref) {
  const trunkP = circuits.find((x) => x.id === c.power_from);
  const trunkG = circuits.find((x) => x.id === c.ground_from);
  const sharedP = trunkP?.power.length ?? 0;
  const sharedG = trunkG?.ground.length ?? 0;
  const power = analyseChain([...(trunkP?.power ?? []), ...c.power]);
  const ground = analyseChain([...(trunkG?.ground ?? []), ...c.ground], false);
  const status = STATUS[chainStatus(power)];
  const product = components.find((x) => x.key === c.component_key);
  const titleId = `${id}-title`;

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`${inline ? "relative w-full" : "absolute z-20 overflow-y-auto"} flex flex-col gap-4 rounded-3xl border border-amber/55 p-5 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-[24px]`}
      style={{ ...style, width: inline ? undefined : RUN_W, maxHeight: inline ? undefined : RUN_H, background: "rgba(1,20,53,0.96)" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-mono text-[10px] tracking-[0.14em] text-amber">{c.kind === "trunk" ? "MAIN RUN" : "CIRCUIT"}</span>
          <span id={titleId} className="font-display text-[28px] font-black leading-none">
            {c.name}
          </span>
          {product && <span className="text-xs text-muted">{[product.title, product.brand].filter(Boolean).join(" · ")}</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close circuit"
          className="-mr-2 -mt-2 flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${status.cls}`}>{status.text}</span>
        {product && onShowSpecs && (
          <button type="button" onClick={onShowSpecs} className="inline-flex min-h-11 cursor-pointer items-center text-[13px] font-semibold text-amber hover:text-lemon">
            Product specs →
          </button>
        )}
      </div>

      <Run title="POWER (+)" items={power} shared={sharedP} sharedName={trunkP?.name} />
      <Run title="GROUND (−)" items={ground} shared={sharedG} sharedName={trunkG?.name} />
      <Cables title="SIGNAL" list={c.cables.filter((x) => x.role === "signal")} />
      <Cables title="SPEAKER" list={c.cables.filter((x) => x.role === "speaker")} />
      <Cables title="OTHER" list={c.cables.filter((x) => x.role === "other")} />
    </div>
  );
});
