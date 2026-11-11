"use client";

import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import type { BeforeAfter as BA } from "@/lib/types";

const VIEWS = [
  { key: "exterior", label: "Exterior" },
  { key: "dashboard", label: "Dashboard" },
  { key: "trunk", label: "Trunk" },
] as const;

/** Before/after comparison. A real range input drives it, so mouse, touch and keyboard all work. */
export function BeforeAfter({ items }: { items: BA[] }) {
  const [view, setView] = useState<BA["view"]>("exterior");
  const [pos, setPos] = useState(50);
  const item = items.find((i) => i.view === view);
  const name = VIEWS.find((v) => v.key === view)!.label;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex max-w-[640px] flex-col gap-3">
          <span className="eyebrow text-amber">Before / after</span>
          <h2 id="compare" className="display m-0 text-[clamp(40px,5vw,56px)] font-extrabold">
            Drag to compare
          </h2>
          <p className="m-0 leading-[1.7] text-muted">Stock on the left, Black Amatis on the right. Slide the handle or use the arrow keys.</p>
        </div>
        <SegmentedTabs options={VIEWS} value={view} onChange={setView} label="Choose view" />
      </div>

      <div className="relative aspect-[16/8] min-h-[260px] select-none overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-prussian-2">
          <Placeholder path={item?.before_path} label={`Stock ${name} photo`} className="h-full w-full justify-start border-0 pl-[8%]" />
        </div>
        <div className="absolute inset-0 bg-lemon" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <Placeholder path={item?.after_path} label={`Black Amatis ${name} photo`} tone="light" className="h-full w-full justify-end border-0 pr-[8%]" />
        </div>
        <span className="absolute left-5 top-5 rounded-full bg-[rgba(0,2,49,0.7)] px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-ink">BEFORE</span>
        <span className="absolute right-5 top-5 rounded-full bg-black px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-lemon">AFTER</span>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 -ml-[1.5px] w-[3px] bg-amber" style={{ left: `${pos}%` }} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -ml-[26px] -mt-[26px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-amber text-prussian shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          style={{ left: `${pos}%` }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Before and after slider, ${name}`}
          aria-valuetext={`${pos}% after`}
          className="ba-range absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-100"
        />
      </div>
    </div>
  );
}
