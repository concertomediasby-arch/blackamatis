import { describe, expect, it } from "vitest";
import { normalizeMotifs, normalizePoints } from "./theme";

describe("theme data", () => {
  it("keeps motif points inside the photo", () => {
    expect(normalizeMotifs([{ id: "a", title: "Naga", meaning: "", x: 120, y: -5 }, null, { title: "B" }])).toEqual([
      { id: "a", title: "Naga", meaning: "", x: 100, y: 0 },
      { id: "m2", title: "B", meaning: "", x: 50, y: 50 },
    ]);
    expect(normalizeMotifs("x")).toEqual([]);
  });
  it("cleans side points", () => {
    expect(normalizePoints([" Lime ", "", 3, "Gold line art"])).toEqual(["Lime", "Gold line art"]);
  });
});
