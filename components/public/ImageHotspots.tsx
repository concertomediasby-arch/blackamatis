"use client";

/* eslint-disable @next/next/no-img-element -- static export; the image keeps its own aspect ratio */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { popoverPosition } from "@/lib/diagram";
import { normalizeHotspots, type Hotspot } from "@/lib/photo";

/** Below this width the detail panel opens under the image instead of next to the device. */
const FLOAT_MIN_WIDTH = 760;

export type HotspotTarget = { id: string; title: string; ariaLabel: string; spots: Hotspot[] | null | undefined };
export type DetailProps = { ref: React.Ref<HTMLDivElement>; id: string; style: React.CSSProperties; inline: boolean; onClose: () => void };

/**
 * An image with invisible clickable areas. A click opens the target's detail
 * panel (beside the area on wide screens, under the image on phones); Esc, the
 * panel's close button or a second click closes it and focus returns.
 */
export function ImageHotspots({
  imageUrl,
  alt,
  targets,
  size: panelSize,
  renderDetail,
}: {
  imageUrl: string;
  alt: string;
  targets: HotspotTarget[];
  /** Panel size used to place it beside the area. */
  size: (targetId: string) => { w: number; h: number };
  renderDetail: (targetId: string, p: DetailProps) => React.ReactNode;
}) {
  const uid = useId().replace(/:/g, "");
  const boxRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef(new Map<string, HTMLButtonElement>());
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState<string | null>(null);

  const spots = targets.flatMap((t) => normalizeHotspots(t.spots).map((s, i) => ({ key: `${t.id}-${i}`, target: t, ...s })));

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
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

  const active = spots.find((s) => s.key === open);
  const floating = box.w >= FLOAT_MIN_WIDTH;
  const pop = active ? panelSize(active.target.id) : { w: 0, h: 0 };
  const pos =
    active && floating
      ? popoverPosition({ x: (active.x / 100) * box.w, y: (active.y / 100) * box.h, w: (active.w / 100) * box.w }, pop, { width: box.w, height: Math.max(box.h, pop.h + 16) })
      : null;
  const detail = (style: React.CSSProperties, inline: boolean) =>
    active && renderDetail(active.target.id, { ref: popRef, id: `${uid}-pop`, style, inline, onClose: close });

  return (
    <div className="flex flex-col gap-4">
      <div ref={boxRef} className="relative">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <img src={imageUrl} alt={alt} className="block h-auto w-full" />
        </div>
        {spots.map((s) => {
          const on = open === s.key;
          return (
            <button
              key={s.key}
              ref={(el) => {
                if (el) btnRefs.current.set(s.key, el);
                else btnRefs.current.delete(s.key);
              }}
              type="button"
              aria-expanded={on}
              aria-controls={on ? `${uid}-pop` : undefined}
              aria-label={s.target.ariaLabel}
              title={s.target.title}
              onClick={() => (on ? close() : setOpen(s.key))}
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
