"use client";

import { useEffect, useRef, useState } from "react";
import { PAGE_COPY, PageHeader } from "@/components/public/PageHeader";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import {
  DEFAULT_PAGE_LAYOUTS,
  HISTORY_LAYOUT_LIMITS,
  PAGE_KEYS,
  pageLayoutOf,
  type PageKey,
  type PageLayout,
} from "@/lib/page-layout";
import { useEditor } from "../EditorProvider";
import { Card, btn } from "../Field";

/** The public page is designed at this width; the preview shows it scaled to fit the card. */
const PAGE_WIDTH = 1440;

/**
 * Editor › Vehicle & Story › Page layouts: per page (History, Installation,
 * Bonus Point, Judge Mode), where the headline and intro text sit, with a
 * live preview. History is stored in `history_layout`, the others in
 * `page_layouts[page]`.
 */
export function PageLayoutsEditor() {
  const { content, update } = useEditor();
  const v = content.vehicle;
  const [page, setPage] = useState<PageKey>("history");
  const l = pageLayoutOf(v, page);
  const set = (p: Partial<PageLayout>) =>
    update((c) => {
      const next = { ...pageLayoutOf(c.vehicle, page), ...p };
      if (page === "history")
        return { ...c, vehicle: { ...c.vehicle, history_layout: next } };
      const all = (
        c.vehicle.page_layouts && typeof c.vehicle.page_layouts === "object"
          ? c.vehicle.page_layouts
          : {}
      ) as Record<string, unknown>;
      return {
        ...c,
        vehicle: { ...c.vehicle, page_layouts: { ...all, [page]: next } },
      };
    });

  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(300);
  useEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;
    const ro = new ResizeObserver(() => {
      const s = box.clientWidth / PAGE_WIDTH;
      setScale(s);
      setHeight(inner.offsetHeight * s);
    });
    ro.observe(box);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  const sliders: { k: "gap" | "width" | "margin"; label: string }[] = [
    { k: "gap", label: "Space between headline and text" },
    { k: "width", label: "Text width" },
    { k: "margin", label: "Page margin (left / right)" },
  ];

  return (
    <Card title="Page layouts" id="page-layouts">
      <p className="m-0 text-sm text-[#4a4852]">
        Where the headline and the intro text sit, set per page (tablets and
        wider; phones always show the text under the headline). The preview
        shows a 1440 px wide screen.
      </p>
      <SegmentedTabs
        options={PAGE_KEYS.map((k) => ({ key: k, label: PAGE_COPY[k].name }))}
        value={page}
        onChange={setPage}
        label="Page"
        tone="light"
      />
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">
            {page === "history" ? "Story" : "Intro text"}
          </span>
          <SegmentedTabs
            options={[
              { key: "beside", label: "Beside the headline" },
              { key: "below", label: "Under the headline" },
            ]}
            value={l.story}
            onChange={(story) => set({ story })}
            label="Story position"
            tone="light"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Block</span>
          <SegmentedTabs
            options={[
              { key: "start", label: "Left" },
              { key: "center", label: "Centre" },
              ...(l.story === "beside"
                ? [{ key: "spread" as const, label: "Spread (left · right)" }]
                : []),
            ]}
            value={
              l.story === "below" && l.align === "spread" ? "start" : l.align
            }
            onChange={(align) => set({ align })}
            label="Block alignment"
            tone="light"
          />
        </div>
        {l.story === "beside" && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Line up</span>
            <SegmentedTabs
              options={[
                { key: "start", label: "Top" },
                { key: "end", label: "Bottom" },
              ]}
              value={l.valign}
              onChange={(valign) => set({ valign })}
              label="Vertical alignment"
              tone="light"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {sliders.map((x) => {
          const [min, max] = HISTORY_LAYOUT_LIMITS[x.k];
          return (
            <label
              key={x.k}
              className="grid grid-cols-[minmax(0,220px)_1fr_64px] items-center gap-3 text-[13px] font-semibold"
            >
              {x.label}
              <input
                type="range"
                min={min}
                max={max}
                step={4}
                value={l[x.k]}
                onChange={(e) => set({ [x.k]: Number(e.target.value) })}
                className="accent-prussian"
              />
              <span className="text-right font-mono text-[12px]">
                {l[x.k]} px
              </span>
            </label>
          );
        })}
      </div>
      <button
        type="button"
        className={`${btn.secondary} self-start`}
        onClick={() => set(DEFAULT_PAGE_LAYOUTS[page])}
      >
        Reset
      </button>
      <div
        ref={boxRef}
        aria-label={`Preview of the ${PAGE_COPY[page].name} page top`}
        className="overflow-hidden rounded-xl bg-prussian text-ink"
        style={{ height }}
      >
        <div
          ref={innerRef}
          style={{
            width: PAGE_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="pointer-events-none"
        >
          <PageHeader
            page={page}
            layout={l}
            text={page === "history" ? v.story : undefined}
          />
        </div>
      </div>
    </Card>
  );
}
