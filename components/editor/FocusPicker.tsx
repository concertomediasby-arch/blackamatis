"use client";

/* eslint-disable @next/next/no-img-element -- plain <img> keeps the click position mapped 1:1 to the photo */
import { useId, useRef } from "react";
import { objectPosition, splitPhoto, withFocus, type Focus } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";

const SHAPES = [
  { label: "Square", ratio: "1 / 1" },
  { label: "4:3", ratio: "4 / 3" },
  { label: "Wide", ratio: "16 / 9" },
];

/**
 * Pick the part of a photo that must stay visible when the site crops it.
 * Click (or drag) on the photo, or use the two sliders; the previews show the crops.
 */
export function FocusPicker({ value, onChange }: { value: string; onChange: (path: string | null) => void }) {
  const uid = useId();
  const imgRef = useRef<HTMLImageElement>(null);
  const { focus } = splitPhoto(value);
  const f: Focus = focus ?? { x: 50, y: 50 };
  const url = storageUrl(value);
  if (!url) return null;

  const set = (next: Focus) => onChange(withFocus(value, next));
  const fromPointer = (e: React.PointerEvent) => {
    const r = imgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    set({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-editor-border bg-white p-4">
      <p className="m-0 text-sm text-[#4a4852]">Click the most important part of the photo. The site keeps that point in view wherever the photo is cropped.</p>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative inline-block self-start">
          <img
            ref={imgRef}
            src={url}
            alt="Choose the focus point"
            draggable={false}
            className="block max-h-[320px] w-auto max-w-full cursor-crosshair touch-none select-none rounded-lg"
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              fromPointer(e);
            }}
            onPointerMove={(e) => e.buttons === 1 && fromPointer(e)}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_#000231,0_4px_12px_rgba(0,0,0,0.5)]"
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          />
        </div>
        <div className="flex min-w-[220px] flex-1 flex-col gap-3">
          <label htmlFor={`${uid}-x`} className="text-sm font-semibold">
            Horizontal focus <span className="font-mono font-normal text-[#55535c]">{f.x}%</span>
          </label>
          <input id={`${uid}-x`} type="range" min={0} max={100} value={f.x} onChange={(e) => set({ ...f, x: Number(e.target.value) })} className="accent-prussian" />
          <label htmlFor={`${uid}-y`} className="text-sm font-semibold">
            Vertical focus <span className="font-mono font-normal text-[#55535c]">{f.y}%</span>
          </label>
          <input id={`${uid}-y`} type="range" min={0} max={100} value={f.y} onChange={(e) => set({ ...f, y: Number(e.target.value) })} className="accent-prussian" />
          <button type="button" onClick={() => onChange(withFocus(value, null))} className="pill self-start border border-editor-border bg-white px-4 text-sm">
            Reset to centre
          </button>
        </div>
      </div>
      <div>
        <span className="text-sm font-semibold">How it is cropped</span>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          {SHAPES.map((s) => (
            <figure key={s.label} className="m-0 flex flex-col gap-1">
              <img src={url} alt="" className="h-20 rounded-md object-cover" style={{ aspectRatio: s.ratio, objectPosition: objectPosition(f) }} />
              <figcaption className="text-[11px] text-[#55535c]">{s.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
