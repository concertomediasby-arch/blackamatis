import { describe, expect, it } from "vitest";
import { customSpecs, specRows } from "./specs";

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
