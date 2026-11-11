import { describe, expect, it } from "vitest";
import { newComponent, uniqueKey } from "./components";

describe("new components", () => {
  it("makes a unique diagram key from the title", () => {
    expect(uniqueKey("Amplifier STEG", [])).toBe("amplifier_steg");
    expect(uniqueKey("Amplifier STEG", ["amplifier_steg"])).toBe("amplifier_steg_2");
    expect(uniqueKey("  ", [])).toBe("component");
  });

  it("creates a component with role, sort and optional areas", () => {
    const c = newComponent({ title: "Subwoofer 12\"", type: "speaker", existing: [], hotspots: [{ x: 1, y: 2, w: 3, h: 4 }] });
    expect(c).toMatchObject({ key: "subwoofer_12", role: "SPEAKERS", sort: 1, in_system: false, hotspots: [{ x: 1, y: 2, w: 3, h: 4 }] });
    expect(c.id.startsWith("new-")).toBe(true);
  });
});
