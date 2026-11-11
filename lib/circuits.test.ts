import { describe, expect, it } from "vitest";
import { normalizeCircuit } from "./circuits";

describe("circuit rows", () => {
  it("fills safe defaults and cleans values", () => {
    const c = normalizeCircuit({
      id: "x",
      kind: "trunk",
      power: [{ t: "node", label: "Battery +" }, { t: "cable", awg: "0 AWG", length_cm: "30" }, "junk"],
      cables: [{ role: "speaker", to_key: "", awg: 16 }],
    } as never);
    expect(c.power).toEqual([
      { id: "n0", t: "node", label: "Battery +", fuse_a: null, is_fuse: false },
      { id: "c1", t: "cable", name: "", awg: "0", length_cm: 30 },
    ]);
    expect(c.cables[0]).toMatchObject({ role: "speaker", to_key: null, awg: "16", length_cm: null });
    expect(c).toMatchObject({ kind: "trunk", ground: [], wiring_hotspots: [], power_from: null });
  });
});
