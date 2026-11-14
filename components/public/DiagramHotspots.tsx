"use client";

/* eslint-disable @next/next/no-img-element -- static export; the image keeps its own aspect ratio */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { popoverPosition } from "@/lib/diagram";
import { isPlaceholder } from "@/lib/format";
import { normalizeHotspots, type HotspotField } from "@/lib/photo";
import { SYSTEM_DIAGRAM_HIDDEN_SPECS } from "@/lib/specs";
import type { AudioComponent, Photo, WiringLink } from "@/lib/types";
import { CIRCUIT_H, CIRCUIT_W, CircuitCard } from "./CircuitCard";
import { POPOVER_H, POPOVER_W, SpecPopover } from "./SpecPopover";

/** Below this width the spec sheet opens under the image instead of next to the device. */
const FLOAT_MIN_WIDTH = 760;

type Spot = { id: string; component: AudioComponent; x: number; y: number; w: number; h: number };

/**
 * The team's diagram image (system or wiring) with a clickable area over each device.
 * A click opens that component's spec sheet; Esc, the × button or a second
 * click closes it, and focus returns to the device.
 */
export function DiagramHotspots({
  imageUrl,
  alt,
  components,
  field = "hotspots",
  circuit,
}: {
  imageUrl: string;
  alt: string;
  components: AudioComponent[];
  /** Which areas to use: the system diagram's or the wiring diagram's. */
  field?: HotspotField;
  /** Cable diagram: open a circuit card (power path, cable, fuse, proof photos) instead of the spec sheet. */
  circuit?: { links: WiringLink[]; photos: Photo[] };
}) {
  const uid = useId().replace(/:/g, "");
  const boxRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef(new Map<string, HTMLButtonElement>());
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState<string | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);

  const spots: Spot[] = components.flatMap((c) => normalizeHotspots(c[field]).map((s, i) => ({ id: `${c.id}-${i}`, component: c, ...s })));

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const close = useCallback(() => {
    setOpen((cur) => {
      if (cur) btnRefs.current.get(cur)?.focus();
      return null;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    popRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, showSpecs, close]);

  const active = spots.find((s) => s.id === open);
  const asCircuit = !!circuit && !showSpecs;
  const pop = asCircuit ? { w: CIRCUIT_W, h: CIRCUIT_H } : { w: POPOVER_W, h: POPOVER_H };
  const floating = size.w >= FLOAT_MIN_WIDTH;
  const pos =
    active && floating
      ? popoverPosition({ x: (active.x / 100) * size.w, y: (active.y / 100) * size.h, w: (active.w / 100) * size.w }, pop, { width: size.w, height: Math.max(size.h, pop.h + 16) })
      : null;
  const detail = (style: React.CSSProperties, inline: boolean) =>
    active &&
    (asCircuit ? (
      <CircuitCard
        ref={popRef}
        id={`${uid}-pop`}
        component={active.component}
        components={components}
        links={circuit.links}
        photos={circuit.photos}
        style={style}
        inline={inline}
        onClose={close}
        onShowSpecs={() => setShowSpecs(true)}
      />
    ) : (
      <SpecPopover
        ref={popRef}
        id={`${uid}-pop`}
        component={active.component}
        style={style}
        inline={inline}
        onClose={close}
        onBack={circuit ? () => setShowSpecs(false) : undefined}
        omit={field === "hotspots" ? SYSTEM_DIAGRAM_HIDDEN_SPECS : undefined}
      />
    ));
  const brandModel = (c: AudioComponent) => [c.brand, c.model].filter((x) => !isPlaceholder(x)).join(" ");

  return (
    <div className="flex flex-col gap-4">
      <div ref={boxRef} className="relative">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <img src={imageUrl} alt={alt} className="block h-auto w-full" />
        </div>
        {spots.map((s) => {
          const on = open === s.id;
          const bm = brandModel(s.component);
          return (
            <button
              key={s.id}
              ref={(el) => {
                if (el) btnRefs.current.set(s.id, el);
                else btnRefs.current.delete(s.id);
              }}
              type="button"
              aria-expanded={on}
              aria-controls={on ? `${uid}-pop` : undefined}
              aria-label={`${s.component.title}${bm ? `, ${bm}` : ""}. ${circuit ? "Open circuit: power path, cable and fuse" : "Open spec sheet"}`}
              title={s.component.title}
              onClick={() => {
                setShowSpecs(false);
                if (on) close();
                else setOpen(s.id);
              }}
              // Invisible: no box or dot. Only keyboard focus shows the global focus ring.
              className="absolute cursor-pointer rounded-lg bg-transparent"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
            />
          );
        })}
        {pos && detail({ left: pos.left, top: pos.top }, false)}
      </div>
      {!floating && detail({}, true)}
    </div>
  );
}
