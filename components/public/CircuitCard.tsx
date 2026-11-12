"use client";

import { forwardRef } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { circuitOf, type CircuitLink } from "@/lib/emma/circuit";
import { criterionByKey } from "@/lib/emma/criteria";
import { MAIN_FUSE_MAX_CM } from "@/lib/emma/fuses";
import { isPlaceholder } from "@/lib/format";
import type { AudioComponent, Photo, WiringLink } from "@/lib/types";

export const CIRCUIT_W = 360;
export const CIRCUIT_H = 560;

type Props = {
  id: string;
  component: AudioComponent;
  components: AudioComponent[];
  links: WiringLink[];
  photos: Photo[];
  style: React.CSSProperties;
  inline?: boolean;
  onClose: () => void;
  onShowSpecs: () => void;
};

const STATUS = {
  ok: { text: "✓ Fuses match VW75212", cls: "border-lemon/50 bg-lemon/10 text-lemon" },
  over: { text: "Fuse and cable per run listed below", cls: "border-white/25 bg-white/5 text-muted" },
  incomplete: { text: "Cable or fuse not filled in yet", cls: "border-white/25 bg-white/5 text-muted" },
  unlinked: { text: "Not linked in Wiring links yet", cls: "border-white/25 bg-white/5 text-muted" },
} as const;

/** Cable and fuse of one link, with the VW75212 result. Unknown values stay as placeholders. */
function LinkLine({ c }: { c: CircuitLink }) {
  const { link, check } = c;
  const cable = link.cable_mm2 != null ? `${link.cable_mm2} mm²` : "[__ mm²]";
  const fuse = link.fuse_a != null ? `${link.fuse_a} A` : "[__ A]";
  return (
    <span className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] tracking-[0.04em]">
      <span className="text-ink">
        {cable} · {fuse}
      </span>
      {check.status === "ok" && <span className="text-lemon">✓ max {check.maxA} A</span>}
    </span>
  );
}

/**
 * Circuit card for the cable diagram: the power path from the battery to the
 * clicked device, cable size and fuse per link checked against VW75212, and
 * the photo-log photos that show those parts.
 */
export const CircuitCard = forwardRef<HTMLDivElement, Props>(function CircuitCard(
  { id, component: c, components, links, photos, style, inline = false, onClose, onShowSpecs },
  ref,
) {
  const byKey = new Map(components.map((x) => [x.key, x]));
  const circuit = circuitOf(c.key, links);
  const brandModel = [c.brand, c.model].filter((x) => !isPlaceholder(x)).join(" ") || "[BRAND / MODEL]";
  const pathKeys = new Set([...circuit.path.map((s) => s.key), ...circuit.feeds.map((f) => f.link.to_key)]);
  const proof = photos.filter((p) => p.component_key && pathKeys.has(p.component_key)).slice(0, 4);
  const status = STATUS[circuit.status];
  const titleId = `${id}-title`;
  const distance = (x: AudioComponent) => x.specs.find((s) => s.k === "Distance to + post")?.v?.trim();

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`${inline ? "relative w-full" : "absolute z-20 overflow-y-auto"} flex flex-col gap-4 rounded-3xl border border-amber/55 p-5 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-[24px]`}
      style={{ ...style, width: inline ? undefined : CIRCUIT_W, maxHeight: inline ? undefined : CIRCUIT_H, background: "rgba(1,20,53,0.96)" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-mono text-[10px] tracking-[0.14em] text-amber">CIRCUIT · {c.role}</span>
          <span id={titleId} className="font-display text-[28px] font-black leading-none">
            {c.title}
          </span>
          <span className="text-xs text-muted">{brandModel}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close circuit card"
          className="-mr-2 -mt-2 flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${status.cls}`}>{status.text}</span>
        <button type="button" onClick={onShowSpecs} className="inline-flex min-h-11 cursor-pointer items-center text-[13px] font-semibold text-amber hover:text-lemon">
          Product specs →
        </button>
      </div>

      {circuit.path.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-2">POWER PATH</span>
          <ol className="m-0 flex list-none flex-col p-0">
            {circuit.path.map((s, i) => {
              const comp = byKey.get(s.key);
              const last = i === circuit.path.length - 1;
              const dist = comp?.type === "main_fuse" ? distance(comp) : undefined;
              return (
                <li key={s.key} className="flex flex-col">
                  {s.in && (
                    <div className="ml-[5px] border-l-2 border-amber/50 py-1.5 pl-4">
                      <LinkLine c={s.in} />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className={`mt-1 h-3 w-3 flex-none rounded-full ${last ? "bg-amber" : "border-2 border-amber"}`} />
                    <span className="flex flex-col">
                      <span className={`text-[14px] ${last ? "font-bold" : ""}`}>{comp?.title ?? s.key}</span>
                      {comp?.type === "main_fuse" && (
                        <span className="text-[11px] text-muted">
                          Distance to + post: {dist && !isPlaceholder(dist) ? dist : "[__ cm]"} · max {MAIN_FUSE_MAX_CM} cm
                        </span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {circuit.feeds.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-2">FEEDS</span>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {circuit.feeds.map((f) => (
              <li key={f.link.id} className="flex flex-col border-b border-white/10 pb-1.5">
                <span className="text-[13px]">→ {byKey.get(f.link.to_key)?.title ?? f.link.to_key}</span>
                <LinkLine c={f} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.14em] text-muted-2">PROOF PHOTOS</span>
        {proof.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {proof.map((p) => (
              <li key={p.id}>
                <a href="#photo-log" className="flex items-center gap-3 rounded-2xl p-1 hover:bg-white/5">
                  <Placeholder path={p.path} label={p.code} alt={p.caption} className="h-12 w-12 flex-none rounded-xl text-[8px]" sizes="48px" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px]">
                      <span className="font-mono text-amber">{p.code}</span> · {p.caption}
                    </span>
                    {p.proves_criterion && <span className="text-[11px] text-lemon">✓ proves: {criterionByKey(p.proves_criterion)?.name ?? p.proves_criterion}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <span className="font-mono text-[11px] tracking-[0.06em] text-muted-2">[NO PHOTO LINKED YET]</span>
        )}
      </div>

    </div>
  );
});
