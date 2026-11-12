import { describe, expect, it } from "vitest";
import {
  DEFAULT_HISTORY_LAYOUT,
  DEFAULT_PAGE_LAYOUTS,
  normalizeHistoryLayout,
  DEFAULT_HOME_LAYOUT,
  DEFAULT_THEME_LAYOUT,
  headlineCss,
  homeLayoutOf,
  pageLayoutOf,
  themeLayoutOf,
} from "./page-layout";

describe("normalizeHistoryLayout", () => {
  it("falls back to the default for missing or bad values", () => {
    expect(normalizeHistoryLayout(null)).toEqual(DEFAULT_HISTORY_LAYOUT);
    expect(normalizeHistoryLayout({ story: "x", gap: "wide" })).toEqual(
      DEFAULT_HISTORY_LAYOUT,
    );
  });

  it("keeps valid choices and clamps sizes", () => {
    expect(
      normalizeHistoryLayout({
        story: "below",
        align: "center",
        valign: "start",
        gap: 999,
        width: 100,
        margin: 64.4,
      }),
    ).toEqual({
      ...DEFAULT_HISTORY_LAYOUT,
      story: "below",
      align: "center",
      valign: "start",
      gap: 240,
      width: 360,
      margin: 64,
    });
  });
});

describe("pageLayoutOf", () => {
  it("reads History from history_layout and other pages from page_layouts, else their default", () => {
    const v = {
      history_layout: { align: "center" },
      page_layouts: { bonus: { story: "below", margin: 20 } },
    };
    expect(pageLayoutOf(v, "history").align).toBe("center");
    expect(pageLayoutOf(v, "bonus")).toEqual({
      ...DEFAULT_PAGE_LAYOUTS.bonus,
      story: "below",
      margin: 20,
    });
    expect(pageLayoutOf(v, "judge")).toEqual(DEFAULT_PAGE_LAYOUTS.judge);
    expect(pageLayoutOf({}, "installation").align).toBe("spread");
  });
});

describe("themeLayoutOf", () => {
  it("defaults to the current look and clamps saved values", () => {
    expect(themeLayoutOf({})).toEqual(DEFAULT_THEME_LAYOUT);
    expect(
      themeLayoutOf({
        page_layouts: {
          theme: {
            margin: 999,
            gap: 2,
            photo: "short",
            headline: 300,
            padding: 4,
            dark_photo: { scale: 130, x: 5 },
            leading: 10,
            tracking: 12,
          },
        },
      }),
    ).toEqual({
      ...DEFAULT_THEME_LAYOUT,
      margin: 200,
      gap: 8,
      photo: "short",
      headline: 160,
      padding: 16,
      dark_photo: { x: 5, y: 0, scale: 130 },
      leading: 70,
      tracking: 12,
    });
    expect(
      themeLayoutOf({ page_layouts: { theme: { photo: "huge" } } }).photo,
    ).toBe("large");
  });
});

describe("headline style on every page", () => {
  it("page headers and Home default to their designed look and clamp saved values", () => {
    expect(pageLayoutOf({}, "bonus")).toMatchObject({
      headline: 100,
      leading: 85,
      tracking: 0,
      spacing: 16,
    });
    expect(
      pageLayoutOf(
        { page_layouts: { judge: { leading: 300, tracking: -20 } } },
        "judge",
      ),
    ).toMatchObject({ leading: 140, tracking: -6 });
    expect(homeLayoutOf({})).toEqual(DEFAULT_HOME_LAYOUT);
    expect(
      homeLayoutOf({ page_layouts: { home: { headline: 120, spacing: 99 } } }),
    ).toEqual({ ...DEFAULT_HOME_LAYOUT, headline: 120, spacing: 64 });
  });

  it("scales the page's fluid size and sets line and letter spacing", () => {
    expect(
      headlineCss(
        { headline: 50, leading: 100, tracking: 4, spacing: 0 },
        64,
        (k) => `${9 * k}vw`,
        128,
      ),
    ).toEqual({
      fontSize: "clamp(32px, 4.5vw, 64px)",
      lineHeight: 1,
      letterSpacing: "0.04em",
    });
  });
});
