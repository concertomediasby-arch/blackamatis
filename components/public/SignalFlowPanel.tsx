"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import type { DiagramEdge } from "@/lib/diagram";
import type { AudioComponent } from "@/lib/types";
import { normalizeHotspots } from "@/lib/photo";
import { Diagram, type DiagramNode } from "./Diagram";
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
 * Signal flow: the team's own system diagram image when uploaded, with the
 * interactive diagram (spec sheets per product) as a second tab.
 */
export function SignalFlowPanel({
  imageUrl,
  imageAlt,
  nodes,
  edges,
  heading,
  components,
}: {
  imageUrl: string | null;
  imageAlt: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  heading: React.ReactNode;
  /** All components; those with hotspots become clickable on the image. */
  components: AudioComponent[];
}) {
  const [view, setView] = useState<View>("image");
  const showImage = !!imageUrl && view === "image";
  const interactive = <Diagram label="Signal flow" nodes={nodes} edges={edges} columnLabels={["SOURCE", "PROCESSING", "AMPLIFICATION", "SPEAKERS"]} />;
  const titleOf = (k: string) => nodes.find((n) => n.key === k)?.title ?? k;
  const clickable = components.some((c) => normalizeHotspots(c.hotspots).length > 0);

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
            { key: "image", label: "System diagram" },
            { key: "interactive", label: "Specs per product" },
          ]}
          value={view}
          onChange={setView}
          label="Signal flow view"
          mode="tabs"
          idPrefix="signal"
        />
      </div>
      <div id="signal-panel" role="tabpanel" aria-labelledby={`signal-tab-${view}`} className="flex flex-col gap-4">
        {showImage ? (
          <>
            {clickable && (
              <div className="flex justify-end">
                <Hint>Click a device on the diagram to see its specs</Hint>
              </div>
            )}
            <DiagramHotspots
              imageUrl={imageUrl}
              alt={imageAlt || "System diagram of Black Amatis: source, processing, amplification and speakers"}
              components={components}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-amber hover:text-lemon">
                Open full size ↗
              </a>
              <button type="button" onClick={() => setView("interactive")} className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-amber hover:text-lemon">
                See the spec sheet of each product →
              </button>
            </div>
            {edges.length > 0 && (
              <div className="sr-only">
                <h3>Signal flow as a list</h3>
                <ul>
                  {edges.map((e) => (
                    <li key={`${e.from}>${e.to}`}>
                      {titleOf(e.from)} to {titleOf(e.to)}
                    </li>
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
