"use client";

import { useEffect, useRef, useState } from "react";
import { PAGE_COPY, PageHeader } from "@/components/public/PageHeader";
import { ThemeSides } from "@/components/public/ThemeSides";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import {
  DEFAULT_PAGE_LAYOUTS,
  HISTORY_LAYOUT_LIMITS,
  PAGE_KEYS,
  DEFAULT_THEME_LAYOUT,
  THEME_LAYOUT_LIMITS,
  pageLayoutOf,
  themeLayoutOf,
  type PageKey,
  type PageLayout,
  type ThemeLayout,
} from "@/lib/page-layout";
import { useEditor } from "../EditorProvider";
import { Card, btn } from "../Field";
import { LayoutSliders } from "../LayoutSliders";

/** The public page is designed at this width; the preview shows it scaled to fit the card. */
const PAGE_WIDTH = 1440;

/** Tabs in the order of the site menu. */
const TABS: { key: PageKey | "theme"; label: string }[] = [
  { key: "history", label: PAGE_COPY.history.name },
  { key: "theme", label: "Theme" },
  ...PAGE_KEYS.filter((k) => k !== "history").map((k) => ({
    key: k,
    label: PAGE_COPY[k].name,
  })),
];

/** A 1440 px wide piece of the public page, scaled down to fit the card. */
function ScaledPreview({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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
  return (
    <div
      ref={boxRef}
      aria-label={label}
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
        className="pointer-events-none pb-8"
      >
        {children}
      </div>
    </div>
  );
}

/** Theme tab: page margin, space between the two side cards, photo height. Stored in `page_layouts.theme`. */
function ThemeLayoutFields() {
  const { content, update } = useEditor();
  const v = content.vehicle;
  const t = themeLayoutOf(v);
  const set = (p: Partial<ThemeLayout>) =>
    update((c) => {
      const all = (
        c.vehicle.page_layouts && typeof c.vehicle.page_layouts === "object"
          ? c.vehicle.page_layouts
          : {}
      ) as Record<string, unknown>;
      return {
        ...c,
        vehicle: {
          ...c.vehicle,
          page_layouts: {
            ...all,
            theme: { ...themeLayoutOf(c.vehicle), ...p },
          },
        },
      };
    });
  const sliders: {
    k:
      | "margin"
      | "gap"
      | "padding"
      | "headline"
      | "leading"
      | "tracking"
      | "spacing";
    label: string;
    unit: string;
    step?: number;
  }[] = [
    { k: "headline", label: "Headline size", unit: "%" },
    { k: "leading", label: "Headline line spacing", unit: "%", step: 1 },
    { k: "tracking", label: "Headline letter spacing", unit: "", step: 1 },
    {
      k: "spacing",
      label: "Space above & below the headline",
      unit: "px",
      step: 2,
    },
    { k: "padding", label: "Space inside the cards", unit: "px" },
    { k: "margin", label: "Page margin (left / right)", unit: "px" },
    { k: "gap", label: "Space between the cards", unit: "px" },
  ];
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold">
          Photo height in each card
        </span>
        <SegmentedTabs
          options={[
            { key: "large", label: "Large (16:10)" },
            { key: "medium", label: "Medium (16:9)" },
            { key: "short", label: "Short (21:9)" },
          ]}
          value={t.photo}
          onChange={(photo) => set({ photo })}
          label="Photo height"
          tone="light"
        />
      </div>
      <div className="flex flex-col gap-2">
        {sliders.map((x) => {
          const [min, max] = THEME_LAYOUT_LIMITS[x.k];
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
                step={x.step ?? 4}
                value={t[x.k]}
                onChange={(e) => set({ [x.k]: Number(e.target.value) })}
                className="accent-prussian"
              />
              <span className="text-right font-mono text-[12px]">
                {x.k === "tracking"
                  ? `${(t.tracking / 100).toFixed(2)} em`
                  : `${t[x.k]}${x.unit === "%" ? "%" : " px"}`}
              </span>
            </label>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(
          [
            ["dark_photo", "Dark side photo", v.dark_side_photo_path],
            ["light_photo", "Light side photo", v.light_side_photo_path],
          ] as const
        ).map(([k, label, path]) =>
          path ? (
            <LayoutSliders
              key={k}
              label={`${label}: position & size`}
              value={t[k]}
              onChange={(l) => set({ [k]: l })}
              preview={() => null}
            />
          ) : (
            <p
              key={k}
              className="m-0 rounded-xl border border-dashed border-editor-border p-3 text-[13px] text-[#55535c]"
            >
              {label}: upload it in Editor › Theme › Two sides to set its
              position &amp; size.
            </p>
          ),
        )}
      </div>
      <button
        type="button"
        className={`${btn.secondary} self-start`}
        onClick={() => set(DEFAULT_THEME_LAYOUT)}
      >
        Reset all Theme settings
      </button>
      <ScaledPreview label="Preview of the Theme page top">
        <ThemeSides v={v} layout={t} />
      </ScaledPreview>
    </>
  );
}

/**
 * Editor › Vehicle & Story › Page layouts: per page (History, Installation,
 * Bonus Point, Judge Mode), where the headline and intro text sit, with a
 * live preview. History is stored in `history_layout`, the others in
 * `page_layouts[page]`.
 */
export function PageLayoutsEditor() {
  const { content, update } = useEditor();
  const v = content.vehicle;
  const [tab, setTab] = useState<PageKey | "theme">("history");
  const page: PageKey = tab === "theme" ? "history" : tab;
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

  const sliders: { k: "gap" | "width" | "margin"; label: string }[] = [
    { k: "gap", label: "Space between headline and text" },
    { k: "width", label: "Text width" },
    { k: "margin", label: "Page margin (left / right)" },
  ];

  return (
    <Card title="Page layouts" id="page-layouts">
      <p className="m-0 text-sm text-[#4a4852]">
        Where the headline and the intro text sit, set per page. For Theme:
        headline size and spacing, space inside and between the two side cards,
        page margin, photo height and each photo&apos;s position &amp; size.
        Settings apply from tablet width; phones always stack. The preview shows
        a 1440 px wide screen.
      </p>
      <SegmentedTabs
        options={TABS}
        value={tab}
        onChange={setTab}
        label="Page"
        tone="light"
      />
      {tab === "theme" ? (
        <ThemeLayoutFields />
      ) : (
        <>
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
                    ? [
                        {
                          key: "spread" as const,
                          label: "Spread (left · right)",
                        },
                      ]
                    : []),
                ]}
                value={
                  l.story === "below" && l.align === "spread"
                    ? "start"
                    : l.align
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
          <ScaledPreview
            label={`Preview of the ${PAGE_COPY[page].name} page top`}
          >
            <PageHeader
              page={page}
              layout={l}
              text={page === "history" ? v.story : undefined}
            />
          </ScaledPreview>
        </>
      )}
    </Card>
  );
}
