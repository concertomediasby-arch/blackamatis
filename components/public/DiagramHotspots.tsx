"use client";

/* eslint-disable @next/next/no-img-element -- static export; the image keeps its own aspect ratio */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { popoverPosition } from "@/lib/diagram";
import { isPlaceholder } from "@/lib/format";
import { normalizeHotspots } from "@/lib/photo";
import type { AudioComponent } from "@/lib/types";
import { POPOVER_H, POPOVER_W, SpecPopover } from "./SpecPopover";

/** Below this width the spec sheet opens under the image instead of next to the device. */
const FLOAT_MIN_WIDTH = 760;

type Spot = { id: string; component: AudioComponent; x: number; y: number; w: number; h: number };

/**
 * The team's system diagram image with a clickable area over each device.
 * A click opens that component's spec sheet; Esc, the × button or a second
 * click closes it, and focus returns to the device.
 */
export function DiagramHotspots({ imageUrl, alt, components }: { imageUrl: string; alt: string; components: AudioComponent[] }) {
  const uid = useId().replace(/:/g, "");
  const boxRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef(new Map<string, HTMLButtonElement>());
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState<string | null>(null);

  const spots: Spot[] = components.flatMap((c) => normalizeHotspots(c.hotspots).map((s, i) => ({ id: `${c.id}-${i}`, component: c, ...s })));

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
  }, [open, close]);

  const active = spots.find((s) => s.id === open);
  const floating = size.w >= FLOAT_MIN_WIDTH;
  const pos =
    active && floating
      ? popoverPosition({ x: (active.x / 100) * size.w, y: (active.y / 100) * size.h, w: (active.w / 100) * size.w }, { w: POPOVER_W, h: POPOVER_H }, { width: size.w, height: Math.max(size.h, POPOVER_H + 16) })
      : null;
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
              aria-label={`${s.component.title}${bm ? `, ${bm}` : ""}. Open spec sheet`}
              title={s.component.title}
              onClick={() => (on ? close() : setOpen(s.id))}
              // Invisible: no box or dot. Only keyboard focus shows the global focus ring.
              className="absolute cursor-pointer rounded-lg bg-transparent"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
            />
          );
        })}
        {active && pos && (
          <SpecPopover ref={popRef} id={`${uid}-pop`} component={active.component} style={{ left: pos.left, top: pos.top }} onClose={close} />
        )}
      </div>
      {active && !floating && <SpecPopover ref={popRef} id={`${uid}-pop`} component={active.component} style={{}} onClose={close} inline />}
    </div>
  );
}
