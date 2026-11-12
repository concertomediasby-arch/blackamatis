import { describe, expect, it } from "vitest";
import {
  DEFAULT_HISTORY_LAYOUT,
  normalizeHistoryLayout,
} from "./history-layout";

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
