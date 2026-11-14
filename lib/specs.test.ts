import { describe, expect, it } from "vitest";
import { SYSTEM_DIAGRAM_HIDDEN_SPECS, customSpecs, specRows } from "./specs";

describe("specRows", () => {
  it("keeps the standard fields in order with placeholders, then own rows", () => {
    const rows = specRows("amplifier", [
      { k: "Extra", v: "Remote turn-on" },
      { k: "Channels", v: "4" },
    ]);
    expect(rows.slice(0, 2)).toEqual([
      { k: "Channels", v: "4" },
      { k: "RMS @ 4Ω", v: "[—]" },
    ]);
    expect(rows.at(-1)).toEqual({ k: "Extra", v: "Remote turn-on" });
  });

  it("shows only the editor's own rows for Other, skipping rows without a label", () => {
    const rows = specRows("other", [
      { k: "Capacity", v: "2 TB" },
      { k: "  ", v: "orphan" },
      { k: "Interface", v: "" },
    ]);
    expect(rows).toEqual([
      { k: "Capacity", v: "2 TB" },
      { k: "Interface", v: "[—]" },
    ]);
  });
});

describe("specRows with omit (System diagram)", () => {
  it("leaves out fuse and mounting rows, standard and own, in any letter case", () => {
    const hu = specRows("head_unit", [{ k: "Type", v: "Streamer" }], SYSTEM_DIAGRAM_HIDDEN_SPECS);
    expect(hu.map((s) => s.k)).toEqual(["Type", "Outputs", "Digital output", "Screen / control"]);

    const amp = specRows("amplifier", [], SYSTEM_DIAGRAM_HIDDEN_SPECS).map((s) => s.k);
    expect(amp).not.toContain("Fuse");
    expect(amp).not.toContain("Mounting location");
    expect(amp).toContain("Power cable");

    const other = specRows(
      "other",
      [
        { k: "Mounting location", v: "Dashboard" },
        { k: "mounting location ", v: "x" },
        { k: "Interface", v: "USB" },
      ],
      SYSTEM_DIAGRAM_HIDDEN_SPECS,
    );
    expect(other).toEqual([{ k: "Interface", v: "USB" }]);
  });

  it("keeps every row when nothing is omitted (cable diagram, editor)", () => {
    expect(specRows("speaker").map((s) => s.k)).toContain("Mounting location");
    expect(specRows("dsp").map((s) => s.k)).toContain("Power fuse");
  });
});

describe("customSpecs", () => {
  it("returns the rows that are not standard fields, in saved order", () => {
    const own = customSpecs("dsp", [
      { k: "B", v: "2" },
      { k: "Inputs", v: "8" },
      { k: "A", v: "1" },
    ]);
    expect(own.map((s) => s.k)).toEqual(["B", "A"]);
  });
});
