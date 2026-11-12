"use client";

import {
  DEFAULT_HERO_LAYOUT,
  LAYOUT_LIMITS,
  normalizeLayout,
  type HeroLayout,
} from "@/lib/photo";
import { btn } from "./Field";

const SLIDERS: {
  k: keyof HeroLayout;
  label: string;
  min: number;
  max: number;
  unit: string;
}[] = [
  {
    k: "scale",
    label: "Size",
    min: LAYOUT_LIMITS.minScale,
    max: LAYOUT_LIMITS.maxScale,
    unit: "%",
  },
  {
    k: "x",
    label: "Left / right",
    min: -LAYOUT_LIMITS.offset,
    max: LAYOUT_LIMITS.offset,
    unit: "",
  },
  {
    k: "y",
    label: "Up / down",
    min: -LAYOUT_LIMITS.offset,
    max: LAYOUT_LIMITS.offset,
    unit: "",
  },
];

/** "Position & size": a live preview (as it looks on the site) and Size / Left-right / Up-down sliders with Reset. */
export function LayoutSliders({
  value,
  onChange,
  preview,
  label = "Position & size",
}: {
  value: unknown;
  onChange: (l: HeroLayout) => void;
  /** Renders the preview with the current layout. */
  preview: (l: HeroLayout) => React.ReactNode;
  label?: string;
}) {
  const l = normalizeLayout(value);
  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-xl border border-editor-border p-3">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      {preview(l)}
      {SLIDERS.map((x) => (
        <label
          key={x.k}
          className="grid grid-cols-[110px_1fr_48px] items-center gap-3 text-[13px] font-semibold"
        >
          {x.label}
          <input
            type="range"
            min={x.min}
            max={x.max}
            value={l[x.k]}
            onChange={(e) => onChange({ ...l, [x.k]: Number(e.target.value) })}
            className="accent-prussian"
          />
          <span className="text-right font-mono text-[12px]">
            {l[x.k]}
            {x.unit}
          </span>
        </label>
      ))}
      <button
        type="button"
        className={`${btn.secondary} self-start`}
        onClick={() => onChange(DEFAULT_HERO_LAYOUT)}
      >
        Reset
      </button>
    </fieldset>
  );
}
