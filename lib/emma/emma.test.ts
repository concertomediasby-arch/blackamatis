import { describe, expect, it } from "vitest";
import { CLASSES, CLASS_TOTALS, MATRIX_ROWS, columnSum, judgedKeys, maxPoints } from "./matrix";
import { CRITERIA, judgedGroups } from "./criteria";
import { FUSE_TABLE, checkFuse, maxFuseForCable } from "./fuses";
import { estimateBonus, requestPoints } from "./bonus";
import { LOCATION_COUNT, bonusCode, nextBonusNo } from "./bonus-locations";

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
  const req = (submit: boolean, idea = true, execution = 2) => ({ submit, idea, execution });

  it("scores 1 for the idea plus execution, max 3 per request", () => {
    expect(requestPoints({ idea: true, execution: 2 })).toBe(3);
    expect(requestPoints({ idea: true, execution: 5 })).toBe(3);
    expect(requestPoints({ idea: false, execution: 1 })).toBe(1);
    expect(requestPoints({ idea: false, execution: 0 })).toBe(0);
    expect(requestPoints({ idea: true, execution: -1 })).toBe(1);
  });

  it("counts only rows ticked Submit", () => {
    const r = estimateBonus([req(true), req(false), req(true, true, 0), req(false)], "unlimited");
    expect(r.submitted).toBe(2);
    expect(r.candidates).toBe(4);
    expect(r.score).toBe(4);
  });

  it("caps Limited at 15 points and 20 submitted requests", () => {
    const r = estimateBonus(Array.from({ length: 25 }, () => req(true)), "limited");
    expect(r.score).toBe(15);
    expect(r.raw).toBe(60);
    expect(r.overSubmitted).toBe(true);
    expect(r.tooManyCandidates).toBe(true);
  });

  it("caps Unlimited at 100 points and 50 submitted requests", () => {
    const r = estimateBonus(Array.from({ length: 60 }, () => req(true)), "unlimited");
    expect(r.raw).toBe(150);
    expect(r.score).toBe(100);
    const under = estimateBonus(Array.from({ length: 40 }, (_, i) => req(i < 30)), "unlimited");
    expect(under.score).toBe(90);
    expect(under.tooManyCandidates).toBe(false);
  });

  it("flags more candidates than the class allows even when few are submitted", () => {
    const r = estimateBonus(Array.from({ length: 21 }, () => req(false)), "limited");
    expect(r.tooManyCandidates).toBe(true);
    expect(r.score).toBe(0);
  });
});

describe("bonus codes", () => {
  it("prefixes the group and pads the number", () => {
    expect(bonusCode("lights", 5)).toBe("L05");
    expect(bonusCode("new", 62)).toBe("N62");
  });

  it("numbers new requests after the 61-spot catalogue", () => {
    expect(LOCATION_COUNT).toBe(61);
    expect(nextBonusNo([{ no: 1 }, { no: 16 }])).toBe(62);
    expect(nextBonusNo([{ no: 62 }])).toBe(63);
  });
});
