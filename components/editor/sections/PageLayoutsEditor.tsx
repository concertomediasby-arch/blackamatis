"use client";

import { useState } from "react";
import { PAGE_COPY, PageHeader } from "@/components/public/PageHeader";
import { HeroHeadline } from "@/components/public/Hero";
import { PhotoSlider } from "@/components/public/PhotoSlider";
import { ThemeSides } from "@/components/public/ThemeSides";
import { normalizeMedia } from "@/lib/bonus-media";
import { CLASS_INFO } from "@/lib/emma/matrix";
import { heroText } from "@/lib/home";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import {
  DEFAULT_PAGE_LAYOUTS,
  HISTORY_LAYOUT_LIMITS,
  PAGE_KEYS,
  DEFAULT_HISTORY_SLIDER,
  DEFAULT_HOME_LAYOUT,
  HISTORY_SLIDER_LIMITS,
  historySliderOf,
  type HistorySlider,
  DEFAULT_THEME_LAYOUT,
  HEADLINE_LIMITS,
  homeLayoutOf,
  type HeadlineStyle,
  type HomeLayout,
  PHONE_GAP_LIMITS,
  THEME_LAYOUT_LIMITS,
  pageLayoutOf,
  themeLayoutOf,
  type PageKey,
  type PageLayout,
  type ThemeLayout,
} from "@/lib/page-layout";
import { useEditor } from "../EditorProvider";
import { Card, btn } from "../Field";
import { ScaledPreview } from "../ScaledPreview";
import { LayoutSliders } from "../LayoutSliders";

/** Tabs in the order of the site menu. */
type Tab = PageKey | "theme" | "home";
const TABS: { key: Tab; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "history", label: PAGE_COPY.history.name },
  { key: "theme", label: "Theme" },
  ...PAGE_KEYS.filter((k) => k !== "history").map((k) => ({
    key: k,
    label: PAGE_COPY[k].name,
  })),
];

/** The headline's paragraph style: size, line spacing, letter spacing and the space around it. Same on every tab. */
function HeadlineStyleFields({
  value,
  onChange,
  spacingLabel,
}: {
  value: HeadlineStyle;
  onChange: (p: Partial<HeadlineStyle>) => void;
  spacingLabel: string;
}) {
  const rows: {
    k: keyof HeadlineStyle;
    label: string;
    step: number;
    show: (n: number) => string;
  }[] = [
    { k: "headline", label: "Size", step: 2, show: (n) => `${n}%` },
    { k: "leading", label: "Line spacing", step: 1, show: (n) => `${n}%` },
    {
      k: "tracking",
      label: "Letter spacing",
      step: 1,
      show: (n) => `${(n / 100).toFixed(2)} em`,
    },
    { k: "spacing", label: spacingLabel, step: 2, show: (n) => `${n} px` },
  ];
  return (
    <fieldset className="m-0 flex flex-col gap-2 rounded-xl border border-editor-border p-3">
      <legend className="px-1 text-sm font-semibold">Headline</legend>
      {rows.map((x) => {
        const [min, max] = HEADLINE_LIMITS[x.k];
        return (
          <label
            key={x.k}
            className="grid grid-cols-[minmax(0,208px)_1fr_72px] items-center gap-3 text-[13px] font-semibold"
          >
            {x.label}
            <input
              type="range"
              min={min}
              max={max}
              step={x.step}
              value={value[x.k]}
              onChange={(e) => onChange({ [x.k]: Number(e.target.value) })}
              className="accent-prussian"
            />
            <span className="text-right font-mono text-[12px]">
              {x.show(value[x.k])}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

/** Home tab: the hero headline's paragraph style. Stored in `page_layouts.home`; the text itself is in the Landing page card. */
function HomeLayoutFields() {
  const { content, update } = useEditor();
  const v = content.vehicle;
  const h = homeLayoutOf(v);
  const set = (p: Partial<HomeLayout>) =>
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
          page_layouts: { ...all, home: { ...homeLayoutOf(c.vehicle), ...p } },
        },
      };
    });
  return (
    <>
      <p className="m-0 text-[13px] text-[#55535c]">
        The text itself (small line, headline, short copy, button) is edited in
        the Landing page card above.
      </p>
      <HeadlineStyleFields
        value={h}
        onChange={set}
        spacingLabel="Space between the lines of the block"
      />
      <label className="grid grid-cols-[minmax(0,208px)_1fr_72px] items-center gap-3 rounded-xl border border-editor-border p-3 text-[13px] font-semibold">
        Phones: space between the car and the headline
        <input
          type="range"
          min={PHONE_GAP_LIMITS[0]}
          max={PHONE_GAP_LIMITS[1]}
          step={2}
          value={h.phone_gap}
          onChange={(e) => set({ phone_gap: Number(e.target.value) })}
          className="accent-prussian"
        />
        <span className="text-right font-mono text-[12px]">
          {h.phone_gap} px
        </span>
      </label>
      <button
        type="button"
        className={`${btn.secondary} self-start`}
        onClick={() => set(DEFAULT_HOME_LAYOUT)}
      >
        Reset
      </button>
      <ScaledPreview label="Preview of the Home headline">
        <div className="bg-prussian px-[88px] py-16">
          <HeroHeadline
            text={heroText(v.home, CLASS_INFO[v.class]?.name ?? "")}
            headline={h}
          />
        </div>
      </ScaledPreview>
    </>
  );
}

/** History tab: the photo slider under the story (height, space above it, frame line). Stored in `page_layouts.history_slider`. */
function HistorySliderFields() {
  const { content, update } = useEditor();
  const h = historySliderOf(content.vehicle);
  const set = (p: Partial<HistorySlider>) =>
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
            history_slider: { ...historySliderOf(c.vehicle), ...p },
          },
        },
      };
    });
  const rows: {
    k: "height" | "space";
    label: string;
    show: (n: number) => string;
  }[] = [
    { k: "height", label: "Height (of the screen)", show: (n) => `${n}%` },
    {
      k: "space",
      label: "Space between the story and the slider",
      show: (n) => `${n} px`,
    },
  ];
  return (
    <fieldset className="m-0 flex flex-col gap-2 rounded-xl border border-editor-border p-3">
      <legend className="px-1 text-sm font-semibold">Photo slider</legend>
      {rows.map((x) => {
        const [min, max] = HISTORY_SLIDER_LIMITS[x.k];
        return (
          <label
            key={x.k}
            className="grid grid-cols-[minmax(0,208px)_1fr_72px] items-center gap-3 text-[13px] font-semibold"
          >
            {x.label}
            <input
              type="range"
              min={min}
              max={max}
              step={2}
              value={h[x.k]}
              onChange={(e) => set({ [x.k]: Number(e.target.value) })}
              className="accent-prussian"
            />
            <span className="text-right font-mono text-[12px]">
              {x.show(h[x.k])}
            </span>
          </label>
        );
      })}
      <label className="flex min-h-11 items-center gap-3 text-[13px] font-semibold">
        <input
          type="checkbox"
          checked={h.frame}
          onChange={(e) => set({ frame: e.target.checked })}
          className="h-5 w-5 accent-prussian"
        />
        Thin line around the slider
      </label>
      <button
        type="button"
        className={`${btn.secondary} self-start`}
        onClick={() => set(DEFAULT_HISTORY_SLIDER)}
      >
        Reset slider
      </button>
    </fieldset>
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
  const sliders: { k: "margin" | "gap" | "padding"; label: string }[] = [
    { k: "padding", label: "Space inside the cards" },
    { k: "margin", label: "Page margin (left / right)" },
    { k: "gap", label: "Space between the cards" },
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
                step={4}
                value={t[x.k]}
                onChange={(e) => set({ [x.k]: Number(e.target.value) })}
                className="accent-prussian"
              />
              <span className="text-right font-mono text-[12px]">
                {t[x.k]} px
              </span>
            </label>
          );
        })}
      </div>
      <HeadlineStyleFields
        value={t}
        onChange={(p) => set(p)}
        spacingLabel="Space above & below the headline"
      />
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
  const [tab, setTab] = useState<Tab>("home");
  const page: PageKey = tab === "theme" || tab === "home" ? "history" : tab;
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
        Per page: the headline&apos;s size and paragraph style (line spacing,
        letter spacing, space around it) and where the headline and text sit;
        for Theme also the two side cards and their photos. Settings apply from
        tablet width; phones always stack. The preview shows a 1440 px wide
        screen.
      </p>
      <SegmentedTabs
        options={TABS}
        value={tab}
        onChange={setTab}
        label="Page"
        tone="light"
      />
      {tab === "home" ? (
        <HomeLayoutFields />
      ) : tab === "theme" ? (
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
          <HeadlineStyleFields
            value={l}
            onChange={(p) => set(p)}
            spacingLabel="Space under the small line above it"
          />
          {page === "history" && <HistorySliderFields />}
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
              bottom={page === "history" ? historySliderOf(v).space : undefined}
            />
            {page === "history" && (
              <div className="px-10">
                <PhotoSlider
                  photos={normalizeMedia(v.history_photos)}
                  label="Preview of the History slider"
                  maxVh={historySliderOf(v).height}
                  bordered={historySliderOf(v).frame}
                />
              </div>
            )}
          </ScaledPreview>
        </>
      )}
    </Card>
  );
}
