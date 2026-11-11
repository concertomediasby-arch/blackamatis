import { describe, expect, it } from "vitest";
import type { ChainItem } from "../types";
import { analyseChain, chainStatus } from "./chain";
import { awgToMm2, maxFuseForAwg } from "./fuses";

const node = (label: string, fuse_a?: number): ChainItem => ({ id: label, t: "node", label, fuse_a });
const cable = (awg: string | null, length_cm: number | null): ChainItem => ({ id: `${awg}-${length_cm}`, t: "cable", name: "", awg, length_cm });

describe("fuse limits by AWG", () => {
  it("uses the VW75212 AWG column when listed", () => {
    expect(maxFuseForAwg("4")).toBe(125);
    expect(maxFuseForAwg("0")).toBe(250);
    expect(maxFuseForAwg("1/0")).toBe(250);
    expect(maxFuseForAwg("2/0")).toBe(300);
  });
  it("falls back to the real cross-section for other gauges", () => {
    expect(awgToMm2("8")).toBeCloseTo(8.37, 1);
    expect(maxFuseForAwg("8")).toBe(50); // 8.37 mm² → rated as 6 mm²
    expect(maxFuseForAwg("18")).toBe(10); // 0.82 mm² → rated as 0.5 mm²
    expect(maxFuseForAwg("16")).toBe(15); // 1.31 mm² → rated as 1.0 mm²
    expect(maxFuseForAwg("x")).toBeNull();
  });
});

describe("a power run", () => {
  const run = [node("Battery +"), cable("0", 30), node("Main fuse", 200), cable("0", 500), node("Distribution", 100), cable("4", 150), node("Amp"), cable("8", 50), node("Smartcap")];

  it("checks the distance before the first fuse and each cable against its fuse", () => {
    const a = analyseChain(run).filter((i) => i.t === "cable").map((i) => i.check);
    expect(a[0]).toEqual({ kind: "distance", ok: true, maxCm: 40 });
    expect(a[1]).toEqual({ kind: "fuse", fuseA: 200, maxA: 250, ok: true });
    expect(a[2]).toEqual({ kind: "fuse", fuseA: 100, maxA: 125, ok: true });
    expect(a[3]).toEqual({ kind: "fuse", fuseA: 100, maxA: 50, ok: false });
    expect(chainStatus(analyseChain(run))).toBe("over");
  });

  it("reports unknown gauges and leaves ground runs unchecked", () => {
    expect(chainStatus(analyseChain([node("Fuse", 200), cable(null, 30)]))).toBe("incomplete");
    expect(chainStatus(analyseChain([node("Battery −"), cable("0", 500)], false))).toBe("empty");
  });
});
