import { DEFAULT_HERO_LAYOUT, normalizeLayout, type HeroLayout } from "./photo";

/**
 * How a page places its headline and intro text (editor › Vehicle & Story ›
 * Page layouts). History uses `vehicle.history_layout`; Installation, Bonus
 * Point and Judge Mode use `vehicle.page_layouts[page]`.
 */
export type HistoryLayout = {
  /** Story beside the headline, or under it. */
  story: "beside" | "below";
  /** Where the block sits: left, centred, or headline left and story right ("spread"). */
  align: "start" | "center" | "spread";
  /** Headline and story aligned at their top or bottom (beside only). */
  valign: "start" | "end";
  /** Space between headline and story, px. */
  gap: number;
  /** Maximum width of the story, px. */
  width: number;
  /** Left / right page margin on tablets and wider, px. */
  margin: number;
};

export const HISTORY_LAYOUT_LIMITS = {
  gap: [16, 240],
  width: [360, 960],
  margin: [0, 200],
} as const;

export const DEFAULT_HISTORY_LAYOUT: HistoryLayout = {
  story: "beside",
  align: "start",
  valign: "end",
  gap: 80,
  width: 640,
  margin: 48,
};

export type PageLayout = HistoryLayout;
export type PageKey = "history" | "installation" | "bonus" | "judge";
export const PAGE_KEYS: PageKey[] = [
  "history",
  "installation",
  "bonus",
  "judge",
];

/** Installation, Bonus Point and Judge Mode as they looked before: headline left, text right. */
const DEFAULT_SPREAD: PageLayout = {
  story: "beside",
  align: "spread",
  valign: "end",
  gap: 48,
  width: 620,
  margin: 88,
};

export const DEFAULT_PAGE_LAYOUTS: Record<PageKey, PageLayout> = {
  history: DEFAULT_HISTORY_LAYOUT,
  installation: DEFAULT_SPREAD,
  bonus: DEFAULT_SPREAD,
  judge: DEFAULT_SPREAD,
};

const clamp = (v: unknown, [lo, hi]: readonly [number, number], d: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(hi, Math.max(lo, Math.round(v)))
    : d;

/** Accepts anything from the database and returns a safe layout (missing values from `d`). */
export function normalizeHistoryLayout(
  v: unknown,
  d: PageLayout = DEFAULT_HISTORY_LAYOUT,
): HistoryLayout {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    story: o.story === "below" || o.story === "beside" ? o.story : d.story,
    align:
      o.align === "start" || o.align === "center" || o.align === "spread"
        ? o.align
        : d.align,
    valign: o.valign === "start" || o.valign === "end" ? o.valign : d.valign,
    gap: clamp(o.gap, HISTORY_LAYOUT_LIMITS.gap, d.gap),
    width: clamp(o.width, HISTORY_LAYOUT_LIMITS.width, d.width),
    margin: clamp(o.margin, HISTORY_LAYOUT_LIMITS.margin, d.margin),
  };
}

/** The saved layout of a page, or its default. */
export function pageLayoutOf(
  v: { history_layout?: unknown; page_layouts?: unknown },
  page: PageKey,
): PageLayout {
  const saved =
    page === "history"
      ? v.history_layout
      : (
          (v.page_layouts && typeof v.page_layouts === "object"
            ? v.page_layouts
            : {}) as Record<string, unknown>
        )[page];
  return normalizeHistoryLayout(saved, DEFAULT_PAGE_LAYOUTS[page]);
}

/** Theme page: the two-face cards (dark side, light side). Stored in `vehicle.page_layouts.theme`. */
export type ThemeLayout = {
  /** Left / right page margin on tablets and wider, px. */
  margin: number;
  /** Space between the two cards, px. */
  gap: number;
  /** Height of the photo in each card. */
  photo: "large" | "medium" | "short";
  /** Size of the big headline in each card, % of the default. */
  headline: number;
  /** Headline line spacing, % of the font size (85 = tight, as designed). */
  leading: number;
  /** Headline letter spacing, 1/100 em (0 = as designed). */
  tracking: number;
  /** Space above and below the headline, px. */
  spacing: number;
  /** Space between the card's content and its edge, px (top and bottom a third more). */
  padding: number;
  /** Position & size of each side's photo in its frame. */
  dark_photo: HeroLayout;
  light_photo: HeroLayout;
};

export const THEME_LAYOUT_LIMITS = {
  margin: [0, 200],
  gap: [8, 96],
  headline: [50, 160],
  leading: [70, 140],
  tracking: [-6, 30],
  spacing: [0, 64],
  padding: [16, 96],
} as const;

/** The Theme page as it looked before: 40 px margin, 20 px between cards, 16:10 photos, 48 px padding. */
export const DEFAULT_THEME_LAYOUT: ThemeLayout = {
  margin: 40,
  gap: 20,
  photo: "large",
  headline: 100,
  leading: 85,
  tracking: 0,
  spacing: 20,
  padding: 48,
  dark_photo: DEFAULT_HERO_LAYOUT,
  light_photo: DEFAULT_HERO_LAYOUT,
};

/** Accepts anything from the database and returns a safe Theme layout. */
export function normalizeThemeLayout(v: unknown): ThemeLayout {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const d = DEFAULT_THEME_LAYOUT;
  return {
    margin: clamp(o.margin, THEME_LAYOUT_LIMITS.margin, d.margin),
    gap: clamp(o.gap, THEME_LAYOUT_LIMITS.gap, d.gap),
    photo:
      o.photo === "medium" || o.photo === "short" || o.photo === "large"
        ? o.photo
        : d.photo,
    headline: clamp(o.headline, THEME_LAYOUT_LIMITS.headline, d.headline),
    leading: clamp(o.leading, THEME_LAYOUT_LIMITS.leading, d.leading),
    tracking: clamp(o.tracking, THEME_LAYOUT_LIMITS.tracking, d.tracking),
    spacing: clamp(o.spacing, THEME_LAYOUT_LIMITS.spacing, d.spacing),
    padding: clamp(o.padding, THEME_LAYOUT_LIMITS.padding, d.padding),
    dark_photo: normalizeLayout(o.dark_photo),
    light_photo: normalizeLayout(o.light_photo),
  };
}

/** The saved Theme layout, or the default. */
export function themeLayoutOf(v: { page_layouts?: unknown }): ThemeLayout {
  const all = (
    v.page_layouts && typeof v.page_layouts === "object" ? v.page_layouts : {}
  ) as Record<string, unknown>;
  return normalizeThemeLayout(all.theme);
}
