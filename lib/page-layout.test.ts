import { describe, expect, it } from "vitest";
import {
  DEFAULT_HISTORY_LAYOUT,
  DEFAULT_PAGE_LAYOUTS,
  normalizeHistoryLayout,
  DEFAULT_THEME_LAYOUT,
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
        page_layouts: { theme: { margin: 999, gap: 2, photo: "short" } },
      }),
    ).toEqual({ margin: 200, gap: 8, photo: "short" });
    expect(
      themeLayoutOf({ page_layouts: { theme: { photo: "huge" } } }).photo,
    ).toBe("large");
  });
});
