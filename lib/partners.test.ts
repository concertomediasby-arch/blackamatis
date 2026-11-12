import { describe, expect, it } from "vitest";
import { visiblePartners } from "./partners";

describe("visiblePartners", () => {
  it("hides slots without a logo once any logo is uploaded", () => {
    const rows = [
      { id: "a", logo_path: "partners/a.webp" },
      { id: "b", logo_path: null },
      { id: "c", logo_path: "partners/c.webp" },
    ];
    expect(visiblePartners(rows).map((p) => p.id)).toEqual(["a", "c"]);
  });

  it("keeps the placeholders while no logo is uploaded", () => {
    const rows = [
      { id: "a", logo_path: null },
      { id: "b", logo_path: null },
    ];
    expect(visiblePartners(rows)).toHaveLength(2);
  });
});
