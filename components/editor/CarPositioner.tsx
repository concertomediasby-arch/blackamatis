"use client";

import { useId, useRef, useState } from "react";
import { CarPhoto } from "@/components/public/CarPhoto";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { DEFAULT_HERO_LAYOUT, LAYOUT_LIMITS, normalizeCarLayout, type CarPhotoLayout, type HeroLayout } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";
import { btn } from "./Field";

type Screen = "desktop" | "mobile";

/** Stage proportions that mimic the home-page hero on each screen size. */
const STAGE: Record<Screen, { maxW: string; aspect: string; box: string; word: string }> = {
  desktop: { maxW: "max-w-[640px]", aspect: "aspect-[16/7]", box: "w-[62%]", word: "27cqw" },
  mobile: { maxW: "max-w-[320px]", aspect: "aspect-[5/4]", box: "w-[90%]", word: "40cqw" },
};

/**
 * Position and size of the hero car photo, with a live preview. Drag the car or
 * use the sliders; desktop and phone are set separately.
 */
export function CarPositioner({ path, layout, onChange }: { path: string | null; layout: CarPhotoLayout | null; onChange: (l: CarPhotoLayout) => void }) {
  const uid = useId();
  const [screen, setScreen] = useState<Screen>("desktop");
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; start: HeroLayout } | null>(null);
  const url = storageUrl(path);
  const full = normalizeCarLayout(layout);
  const cur = full[screen];
  if (!url) return null;

  const set = (patch: Partial<HeroLayout>) => onChange(normalizeCarLayout({ ...full, [screen]: { ...cur, ...patch } }));
  const st = STAGE[screen];

  const sliders: { key: keyof HeroLayout; label: string; min: number; max: number; unit: string }[] = [
    { key: "x", label: "Left / right", min: -LAYOUT_LIMITS.offset, max: LAYOUT_LIMITS.offset, unit: "%" },
    { key: "y", label: "Up / down", min: -LAYOUT_LIMITS.offset, max: LAYOUT_LIMITS.offset, unit: "%" },
    { key: "scale", label: "Size", min: LAYOUT_LIMITS.minScale, max: LAYOUT_LIMITS.maxScale, unit: "%" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-editor-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold">Position on the home page</span>
        <SegmentedTabs
          options={[
            { key: "desktop", label: "Desktop" },
            { key: "mobile", label: "Phone" },
          ]}
          value={screen}
          onChange={setScreen}
          label="Screen size"
          tone="light"
        />
      </div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className={`relative w-full ${st.maxW} ${st.aspect} touch-none select-none overflow-hidden rounded-xl bg-prussian [container-type:inline-size]`}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display font-black leading-[0.8] text-amber"
            style={{ fontSize: st.word }}
          >
            AMATIS
          </span>
          <div
            ref={boxRef}
            role="img"
            aria-label="Preview of the car on the home page. Drag to move it, or use the sliders."
            className={`absolute left-1/2 top-1/2 ${st.box} -translate-x-1/2 -translate-y-1/2 cursor-grab outline-1 outline-dashed outline-white/25 active:cursor-grabbing`}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, start: cur };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              const r = boxRef.current?.getBoundingClientRect();
              if (!d || !r || r.width === 0) return;
              set({ x: d.start.x + ((e.clientX - d.x) / r.width) * 100, y: d.start.y + ((e.clientY - d.y) / r.height) * 100 });
            }}
            onPointerUp={() => (drag.current = null)}
          >
            <CarPhoto url={url} layout={full} force={screen} />
          </div>
        </div>
        <div className="flex min-w-[220px] flex-1 flex-col gap-3">
          {sliders.map((s) => (
            <div key={s.key} className="flex flex-col gap-1">
              <label htmlFor={`${uid}-${s.key}`} className="text-sm font-semibold">
                {s.label} <span className="font-mono font-normal text-[#55535c]">{cur[s.key]}{s.unit}</span>
              </label>
              <input
                id={`${uid}-${s.key}`}
                type="range"
                min={s.min}
                max={s.max}
                value={cur[s.key]}
                onChange={(e) => set({ [s.key]: Number(e.target.value) })}
                className="accent-prussian"
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn.secondary} onClick={() => set(DEFAULT_HERO_LAYOUT)}>
              Reset
            </button>
            <button
              type="button"
              className={btn.secondary}
              onClick={() => onChange({ ...full, [screen === "desktop" ? "mobile" : "desktop"]: cur })}
            >
              Copy to {screen === "desktop" ? "phone" : "desktop"}
            </button>
          </div>
        </div>
      </div>
      <p className="m-0 text-[13px] text-[#55535c]">
        The preview is a close approximation. After Publish, check the real home page on a computer and on a phone.
      </p>
    </div>
  );
}
