"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { normalizeHotspots, type HotspotField } from "@/lib/photo";
import type { AudioComponent, Circuit, Photo, WiringLink } from "@/lib/types";
import { CableDiagram } from "./CableDiagram";
import { DiagramHotspots } from "./DiagramHotspots";

type View = "image" | "interactive";

const Hint = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2.5 rounded-full border border-lemon/35 bg-lemon/10 px-4 py-2.5 text-[13px] text-lemon">
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l7 17 2.5-7.5L21 11z" />
    </svg>
    {children}
  </span>
);
const HINT = <Hint>Click a product to see its specs</Hint>;

/**
 * A diagram section on the Installation page: the team's own diagram image when
 * uploaded (devices clickable), with the generated interactive diagram as a second tab.
 */
export function DiagramPanel({
  imageUrl,
  imageAlt,
  defaultAlt,
  heading,
  interactive,
  components,
  field,
  tabs,
  idPrefix,
  textList,
  circuit,
  imageHint = "Click a device on the diagram to see its specs",
  circuits,
}: {
  imageUrl: string | null;
  imageAlt: string;
  defaultAlt: string;
  heading: React.ReactNode;
  /** The generated diagram (spec sheets per product). */
  interactive: React.ReactNode;
  /** All components; those with areas in `field` are clickable on the image. */
  components: AudioComponent[];
  field: HotspotField;
  /** Tab labels: [image, generated diagram]. */
  tabs: [string, string];
  idPrefix: string;
  /** The diagram as a text list for screen readers (shown with the image). */
  textList?: { title: string; items: string[] };
  /** Open a circuit card per device instead of the spec sheet (cable diagram). */
  circuit?: { links: WiringLink[]; photos: Photo[] };
  imageHint?: string;
  /** Cable diagram runs (power, ground, cables per device); used instead of per-component areas when any is marked. */
  circuits?: Circuit[];
}) {
  const [view, setView] = useState<View>("image");
  const showImage = !!imageUrl && view === "image";
  const runs = (circuits ?? []).filter((c) => normalizeHotspots(c.wiring_hotspots).length > 0);
  const clickable = runs.length > 0 || components.some((c) => normalizeHotspots(c[field]).length > 0);

  if (!imageUrl) {
    return (
      <>
        <div className="flex flex-wrap items-end justify-between gap-5">
          {heading}
          {HINT}
        </div>
        {interactive}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        {heading}
        <SegmentedTabs
          options={[
            { key: "image", label: tabs[0] },
            { key: "interactive", label: tabs[1] },
          ]}
          value={view}
          onChange={setView}
          label={`${tabs[0]} view`}
          mode="tabs"
          idPrefix={idPrefix}
        />
      </div>
      <div id={`${idPrefix}-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${view}`} className="flex flex-col gap-4">
        {showImage ? (
          <>
            {clickable && (
              <div className="flex justify-end">
                <Hint>{imageHint}</Hint>
              </div>
            )}
            {runs.length > 0 ? (
              <CableDiagram imageUrl={imageUrl} alt={imageAlt || defaultAlt} circuits={circuits!} components={components} />
            ) : (
              <DiagramHotspots imageUrl={imageUrl} alt={imageAlt || defaultAlt} components={components} field={field} circuit={circuit} />
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-amber hover:text-lemon">
                Open full size ↗
              </a>
              <button type="button" onClick={() => setView("interactive")} className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-amber hover:text-lemon">
                See the spec sheet of each product →
              </button>
            </div>
            {textList && textList.items.length > 0 && (
              <div className="sr-only">
                <h3>{textList.title}</h3>
                <ul>
                  {textList.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-end">{HINT}</div>
            {interactive}
          </>
        )}
      </div>
    </>
  );
}
