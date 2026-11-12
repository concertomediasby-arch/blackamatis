"use client";

import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { criterionByKey } from "@/lib/emma/criteria";
import { PHOTO_AREAS, type Photo, type PhotoArea } from "@/lib/types";

/** Photo log with area tabs; `area` fixes the tab from outside (the editor's preview follows its own area tabs). */
export function PhotoLog({ photos, area: fixed }: { photos: Photo[]; area?: PhotoArea }) {
  const [picked, setArea] = useState<PhotoArea>("engine");
  const area = fixed ?? picked;
  const list = photos.filter((p) => p.area === area).sort((a, b) => a.sort - b.sort);
  const options = PHOTO_AREAS.map((a) => ({ key: a.key, label: a.label, count: photos.filter((p) => p.area === a.key).length }));
  const areaLabel = PHOTO_AREAS.find((a) => a.key === area)!.label;

  return (
    <div className="flex flex-col gap-8">
      <SegmentedTabs options={options} value={area} onChange={setArea} label="Photo log area" tone="light" mode="tabs" idPrefix="photolog" />
      <div id="photolog-panel" role="tabpanel" aria-labelledby={`photolog-tab-${area}`} className="flex flex-col gap-4">
        <span className="label text-dark-muted">
          {areaLabel.toUpperCase()} · {list.length} PHOTOS
        </span>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 p-0">
          {list.map((p) => {
            const proves = p.proves_criterion ? criterionByKey(p.proves_criterion)?.name : null;
            return (
              <li key={p.id} className="flex flex-col overflow-hidden rounded-3xl border border-black/15 bg-white/45">
                <Placeholder path={p.path} label={`${p.code} photo`} alt={p.caption} tone="light" className="aspect-[4/3] border-0 border-b" sizes="(max-width: 768px) 100vw, 25vw" />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <span className="font-mono text-xs font-medium tracking-[0.12em] text-navy">{p.code}</span>
                  <span className="text-[15px] font-semibold leading-snug">{p.caption}</span>
                  {proves && (
                    <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-lemon">
                      <span aria-hidden="true">✓</span> proves: {proves}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
