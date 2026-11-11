import { describe, expect, it } from "vitest";
import { dedupeKeys, newComponent, uniqueKey } from "./components";
import { isUuid } from "./ids";

describe("new components", () => {
  it("makes a unique diagram key from the title", () => {
    expect(uniqueKey("Amplifier STEG", [])).toBe("amplifier_steg");
    expect(uniqueKey("Amplifier STEG", ["amplifier_steg"])).toBe("amplifier_steg_2");
    expect(uniqueKey("  ", [])).toBe("component");
  });

  it("creates a component with role, sort and optional areas", () => {
    const c = newComponent({ title: "Subwoofer 12\"", type: "speaker", existing: [], hotspots: [{ x: 1, y: 2, w: 3, h: 4 }] });
    expect(c).toMatchObject({ key: "subwoofer_12", role: "SPEAKERS", sort: 1, in_system: false, hotspots: [{ x: 1, y: 2, w: 3, h: 4 }] });
    expect(isUuid(c.id)).toBe(true);
  });
});

describe("dedupeKeys", () => {
  const c = (id: string, key: string) => ({ ...newComponent({ title: "x", type: "amplifier", existing: [] }), id, key });
  it("keeps the first and suffixes later duplicates", () => {
    const out = dedupeKeys([c("1", "component_11"), c("2", "component_11"), c("3", "dsp"), c("4", "component_11")]);
    expect(out.map((x) => x.key)).toEqual(["component_11", "component_11_2", "dsp", "component_11_3"]);
  });
  it("leaves unique keys untouched (same objects)", () => {
    const list = [c("1", "a"), c("2", "b")];
    const out = dedupeKeys(list);
    expect(out[0]).toBe(list[0]);
    expect(out[1]).toBe(list[1]);
  });
});
