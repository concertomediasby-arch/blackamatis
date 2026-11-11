import { describe, expect, it } from "vitest";
import { circuitSheet } from "./circuit-sheet";
import { normalizeCircuit } from "./circuits";

const trunk = normalizeCircuit({
  id: "t",
  kind: "trunk",
  name: "Main run A",
  power: [{ t: "node", label: "Battery +" }, { t: "cable", awg: "0", length_cm: 30 }, { t: "node", label: "Main fuse", fuse_a: 200 }, { t: "cable", awg: "0", length_cm: 30 }, { t: "node", label: "Distribution A" }],
  ground: [{ t: "node", label: "Battery −" }, { t: "cable", awg: "0", length_cm: 500 }, { t: "node", label: "Ground block A" }],
} as never);
const amp = normalizeCircuit({
  id: "a",
  kind: "channel",
  name: "Left Tweeter",
  power_from: "t",
  ground_from: "t",
  power: [{ t: "node", label: "Fuse", fuse_a: 100 }, { t: "cable", name: "Septuple", awg: "4", length_cm: 200 }, { t: "node", label: "Aurum" }, { t: "cable", awg: "8", length_cm: 65 }, { t: "node", label: "Smartcap" }],
  ground: [{ t: "cable", awg: "4", length_cm: 200 }, { t: "node", label: "Aurum" }],
  cables: [{ role: "speaker", from: "Aurum", to: "Left Tweeter", to_key: "tweeter", awg: "16", length_cm: 500 }],
} as never);

describe("circuit data sheet", () => {
  it("lists only the device's own cables, named by where they go", () => {
    const s = circuitSheet(amp, [trunk, amp], (k) => (k === "tweeter" ? "SS1" : undefined));
    expect(s.rows.map((r) => [r.run, r.to, r.awg])).toEqual([
      ["power", "Aurum", "4"],
      ["power", "Smartcap", "8"],
      ["ground", "Aurum", "4"],
      ["speaker", "SS1", "16"],
    ]);
    expect(s.rows[1].check).toEqual({ kind: "fuse", fuseA: 100, maxA: 50, ok: false });
    expect(s).toMatchObject({ status: "over", powerFrom: "Distribution A", groundTo: "Ground block A", fuses: [{ label: "Fuse", fuse_a: 100 }], sharedPower: 5 });
  });

  it("lists every cable of a main run", () => {
    const s = circuitSheet(trunk, [trunk], () => undefined);
    expect(s.rows.map((r) => [r.run, r.to])).toEqual([
      ["power", "Main fuse"],
      ["power", "Distribution A"],
      ["ground", "Ground block A"],
    ]);
    expect(s.rows[0].check).toEqual({ kind: "distance", ok: true, maxCm: 40 });
    expect(s.status).toBe("ok");
  });
});
