import { describe, expect, it } from "vitest";
import { CLASSES, CLASS_TOTALS, MATRIX_ROWS, columnSum, judgedKeys, maxPoints } from "./matrix";
import { CRITERIA, judgedGroups } from "./criteria";
import { FUSE_TABLE, checkFuse, maxFuseForCable } from "./fuses";
import { estimateBonus, requestPoints } from "./bonus";

describe("installation matrix", () => {
  it.each(CLASSES)("column %s sums to the official total", (cls) => {
    expect(columnSum(cls)).toBe(CLASS_TOTALS[cls]);
  });

  it("matches the judge book totals", () => {
    expect(CLASS_TOTALS).toEqual({ E: 69, S: 115, M: 161, X: 231, XU: 325 });
  });

  it("has one criterion definition per matrix row", () => {
    expect(CRITERIA.map((c) => c.key).sort()).toEqual(MATRIX_ROWS.map((r) => r[0]).sort());
  });

  it("returns null for criteria not judged in a class", () => {
    expect(maxPoints("system_diagram", "M")).toBeNull();
    expect(maxPoints("craftsmanship", "X")).toBe(50);
    expect(maxPoints("speaker_protection", "XU")).toBeNull();
  });

  it("groups judged criteria with matching totals", () => {
    for (const cls of CLASSES) {
      const r = judgedGroups(cls);
      expect(r.total).toBe(CLASS_TOTALS[cls]);
      expect(r.count).toBe(judgedKeys(cls).length);
    }
  });

  it("computes evidence-ready points", () => {
    const r = judgedGroups("X", { main_fuse: true, craftsmanship: true });
    expect(r.readyPts).toBe(60);
    expect(r.pct).toBe(Math.round((60 / 231) * 100));
  });
});

describe("fuse table (VW75212)", () => {
  it("has 12 rows", () => expect(FUSE_TABLE).toHaveLength(12));

  it.each([
    [0.5, 10],
    [1.0, 15],
    [1.5, 20],
    [2.5, 20],
    [4, 30],
    [6, 50],
    [10, 60],
    [16, 100],
    [25, 125],
    [35, 175],
    [50, 250],
    [70, 300],
  ])("%s mm² → %s A", (mm2, a) => {
    expect(maxFuseForCable(mm2)).toBe(a);
  });

  it("rates in-between sizes by the next smaller row", () => {
    expect(maxFuseForCable(20)).toBe(100);
    expect(maxFuseForCable(95)).toBe(300);
  });

  it("returns null below the table", () => {
    expect(maxFuseForCable(0.25)).toBeNull();
  });

  it("flags fuses above the table", () => {
    expect(checkFuse(4, 30).status).toBe("ok");
    expect(checkFuse(4, 40)).toEqual({ status: "over", maxA: 30 });
    expect(checkFuse(null, 40).status).toBe("unknown");
  });
});

describe("bonus estimate", () => {
  it("scores 1 for the idea plus execution", () => {
    expect(requestPoints({ idea: true, execution: 2 })).toBe(3);
    expect(requestPoints({ idea: false, execution: 1 })).toBe(1);
    expect(requestPoints({ idea: false, execution: 0 })).toBe(0);
  });

  it("caps Limited at 15 points and 20 requests", () => {
    const reqs = Array.from({ length: 25 }, () => ({ idea: true, execution: 2 as const }));
    const r = estimateBonus(reqs, "limited");
    expect(r.score).toBe(15);
    expect(r.overCap).toBe(true);
    expect(r.maxRequests).toBe(20);
  });

  it("caps Unlimited at 100 points and 50 requests", () => {
    const reqs = Array.from({ length: 40 }, () => ({ idea: true, execution: 2 as const }));
    const r = estimateBonus(reqs, "unlimited");
    expect(r.raw).toBe(120);
    expect(r.score).toBe(100);
    expect(r.overCap).toBe(false);
  });
});
