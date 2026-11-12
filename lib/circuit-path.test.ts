import { describe, expect, it } from "vitest";
import { clickAreas, inside, pathMarks } from "./circuit-path";
import { normalizeCircuit } from "./circuits";

const box = (x: number) => ({ x, y: 10, w: 2, h: 2 });
const trunkA = normalizeCircuit({
  id: "A",
  name: "Main run A",
  kind: "trunk",
  parts: [
    { id: "bat", label: "Battery +", run: "power", ...box(1) },
    { id: "cap", label: "Ultracap A", run: "both", ...box(5) },
    { id: "dist", label: "Distribution A", run: "power", ...box(9) },
    { id: "gnd", label: "Ground block A", run: "ground", ...box(13) },
  ],
});
const trunkB = normalizeCircuit({
  id: "B",
  name: "Main run B",
  kind: "trunk",
  parts: [
    { id: "bat", label: "Battery +", run: "power", ...box(1) },
    { id: "gndB", label: "Ground block B", run: "ground", ...box(40) },
  ],
});
const tweeter = normalizeCircuit({
  id: "t",
  name: "Left Tweeter",
  kind: "channel",
  power_from: "A",
  ground_from: "B",
  wiring_hotspots: [box(60)],
  parts: [{ id: "f", label: "Fuse A7", run: "power", ...box(20) }],
});

describe("pathMarks", () => {
  it("lights + parts of the power trunk, − parts of the ground trunk, own parts and the device", () => {
    const marks = pathMarks(tweeter, [trunkA, trunkB, tweeter]);
    expect(marks.map((m) => `${m.label}:${m.kind}`)).toEqual([
      "Battery +:power",
      "Ultracap A:both",
      "Distribution A:power",
      "Ground block B:ground",
      "Fuse A7:power",
      "Left Tweeter:device",
    ]);
  });

  it("shows a main run's own parts", () => {
    expect(pathMarks(trunkA, [trunkA]).map((m) => m.label)).toEqual([
      "Battery +",
      "Ultracap A",
      "Distribution A",
      "Ground block A",
    ]);
  });
});

describe("clickAreas", () => {
  it("puts main runs first and skips a box another circuit already uses", () => {
    const areas = clickAreas([tweeter, trunkB, trunkA]);
    expect(areas.map((a) => a.circuit.id)).toEqual([
      "B",
      "B",
      "A",
      "A",
      "A",
      "t",
      "t",
    ]);
  });
});

describe("inside", () => {
  it("detects a box inside a bigger one", () => {
    expect(
      inside({ x: 2, y: 2, w: 1, h: 1 }, { x: 0, y: 0, w: 10, h: 10 }),
    ).toBe(true);
    expect(
      inside({ x: 0, y: 0, w: 10, h: 10 }, { x: 2, y: 2, w: 1, h: 1 }),
    ).toBe(false);
  });
});
