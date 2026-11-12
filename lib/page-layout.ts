import { DEFAULT_HERO_LAYOUT, normalizeLayout, type HeroLayout } from "./photo";

/**
 * Paragraph style of a page's big headline, the same on every page that has
 * one (Home, History, Theme, Installation, Bonus Point, Judge Mode).
 */
export type HeadlineStyle = {
  /** Size, % of the page's default. */
  headline: number;
  /** Line spacing, % of the font size. */
  leading: number;
  /** Letter spacing, 1/100 em. */
  tracking: number;
  /** Space between the headline and the text around it, px. */
  spacing: number;
};

export const HEADLINE_LIMITS = {
  headline: [50, 160],
  leading: [70, 140],
  tracking: [-6, 30],
  spacing: [0, 64],
} as const;

/** The headline's CSS: the page's fluid size (`fluid(k)` for scale k) clamped between its min and max, all scaled. */
export function headlineCss(
  s: HeadlineStyle,
  min: number,
  fluid: (k: number) => string,
  max: number,
) {
  const k = s.headline / 100;
  return {
    fontSize: `clamp(${min * k}px, ${fluid(k)}, ${max * k}px)`,
    lineHeight: s.leading / 100,
    letterSpacing: `${s.tracking / 100}em`,
  };
}

/**
 * How a page places its headline and intro text (editor › Vehicle & Story ›
 * Page layouts). History uses `vehicle.history_layout`; Installation, Bonus
 * Point and Judge Mode use `vehicle.page_layouts[page]`.
 */
export type HistoryLayout = HeadlineStyle & {
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

/** Page headers as designed: full size, tight lines (0.85), 16 px under the eyebrow. */
const PAGE_HEADLINE: HeadlineStyle = {
  headline: 100,
  leading: 85,
  tracking: 0,
  spacing: 16,
};

export const DEFAULT_HISTORY_LAYOUT: HistoryLayout = {
  story: "beside",
  align: "start",
  valign: "end",
  gap: 80,
  width: 640,
  margin: 48,
  ...PAGE_HEADLINE,
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
  ...PAGE_HEADLINE,
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

/** Headline style from the database, with the page's defaults for anything missing. */
export function normalizeHeadline(
  o: Record<string, unknown>,
  d: HeadlineStyle,
): HeadlineStyle {
  return {
    headline: clamp(o.headline, HEADLINE_LIMITS.headline, d.headline),
    leading: clamp(o.leading, HEADLINE_LIMITS.leading, d.leading),
    tracking: clamp(o.tracking, HEADLINE_LIMITS.tracking, d.tracking),
    spacing: clamp(o.spacing, HEADLINE_LIMITS.spacing, d.spacing),
  };
}

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
    ...normalizeHeadline(o, d),
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

/** Home: the hero headline ("One car. Two faces."). Stored in `vehicle.page_layouts.home`. */
export type HomeLayout = HeadlineStyle;

/** The hero as designed: full size, line spacing 0.92, 20 px between its lines of content. */
export const DEFAULT_HOME_LAYOUT: HomeLayout = {
  headline: 100,
  leading: 92,
  tracking: 0,
  spacing: 20,
};

/** The saved Home layout, or the default. */
export function homeLayoutOf(v: { page_layouts?: unknown }): HomeLayout {
  const all = (
    v.page_layouts && typeof v.page_layouts === "object" ? v.page_layouts : {}
  ) as Record<string, unknown>;
  const o = (
    all.home && typeof all.home === "object" ? all.home : {}
  ) as Record<string, unknown>;
  return normalizeHeadline(o, DEFAULT_HOME_LAYOUT);
}

/** History: the photo slider under the story. Stored in `vehicle.page_layouts.history_slider`. */
export type HistorySlider = {
  /** Maximum height of the slide, % of the screen height. */
  height: number;
  /** Space between the story and the slider, px. */
  space: number;
  /** Thin line around the slider. */
  frame: boolean;
};

export const HISTORY_SLIDER_LIMITS = {
  height: [40, 90],
  space: [0, 160],
} as const;

/** The History slider without a frame line, otherwise as before (78 % of the screen, 64 px under the story). */
export const DEFAULT_HISTORY_SLIDER: HistorySlider = {
  height: 78,
  space: 64,
  frame: false,
};

/** The saved History slider settings, or the default. */
export function historySliderOf(v: { page_layouts?: unknown }): HistorySlider {
  const all = (
    v.page_layouts && typeof v.page_layouts === "object" ? v.page_layouts : {}
  ) as Record<string, unknown>;
  const o = (
    all.history_slider && typeof all.history_slider === "object"
      ? all.history_slider
      : {}
  ) as Record<string, unknown>;
  const d = DEFAULT_HISTORY_SLIDER;
  return {
    height: clamp(o.height, HISTORY_SLIDER_LIMITS.height, d.height),
    space: clamp(o.space, HISTORY_SLIDER_LIMITS.space, d.space),
    frame: typeof o.frame === "boolean" ? o.frame : d.frame,
  };
}
