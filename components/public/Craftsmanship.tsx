"use client";

import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { CRAFT_CHECKLIST } from "@/lib/data/craft";
import { CRAFT_CATEGORIES, type CraftCategory, type CraftPhoto } from "@/lib/types";

export function Craftsmanship({ photos }: { photos: CraftPhoto[] }) {
  const [cat, setCat] = useState<CraftCategory>("wiring");
  const list = photos.filter((p) => p.category === cat).sort((a, b) => a.sort - b.sort).slice(0, 3);
  return (
    <div className="flex flex-col gap-8">
      <SegmentedTabs options={CRAFT_CATEGORIES} value={cat} onChange={setCat} label="Craftsmanship category" mode="tabs" idPrefix="craft" />
      <div id="craft-panel" role="tabpanel" aria-labelledby={`craft-tab-${cat}`} className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
          {list.map((p) => (
            <li key={p.id} className="flex flex-col gap-2">
              <Placeholder path={p.path} label={`Close-up: ${p.caption}`} alt={p.caption} className="aspect-[3/4] rounded-3xl" sizes="(max-width: 640px) 100vw, 22vw" />
              <span className="text-sm text-muted">{p.caption}</span>
            </li>
          ))}
        </ul>
        <div className="glass-inset flex flex-col gap-4 rounded-3xl p-6">
          <span className="eyebrow text-amber">What to look at</span>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {CRAFT_CHECKLIST[cat].map((t) => (
              <li key={t} className="flex gap-3 text-[15px] leading-snug">
                <span aria-hidden="true" className="text-amber">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <span className="mt-auto font-mono text-xs tracking-[0.1em] text-muted-2">M: 2 pts · X: 10 pts per category</span>
        </div>
      </div>
    </div>
  );
}
