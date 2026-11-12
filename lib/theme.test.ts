import { describe, expect, it } from "vitest";
import { motifPhotos, normalizeMotifs, normalizePoints } from "./theme";

describe("theme data", () => {
  it("keeps motif points inside the photo", () => {
    expect(normalizeMotifs([{ id: "a", title: "Naga", meaning: "", x: 120, y: -5 }, null, { title: "B" }])).toEqual([
      { id: "a", title: "Naga", meaning: "", x: 100, y: 0, photo: 0 },
      { id: "m2", title: "B", meaning: "", x: 50, y: 50, photo: 0 },
    ]);
    expect(normalizeMotifs("x")).toEqual([]);
  });
  it("keeps the photo a motif sits on", () => {
    expect(normalizeMotifs([{ id: "a", x: 10, y: 20, photo: 2 }, { id: "b", photo: -1 }, { id: "c", photo: 1.5 }]).map((m) => m.photo)).toEqual([2, 0, 0]);
  });
  it("lists the motif photos, falling back to the older single photo", () => {
    expect(motifPhotos({ motif_photos: ["a.webp", "", 3, "b.webp"], motif_photo_path: "x.webp" })).toEqual(["a.webp", "b.webp"]);
    expect(motifPhotos({ motif_photos: [], motif_photo_path: "x.webp" })).toEqual(["x.webp"]);
    expect(motifPhotos({})).toEqual([]);
  });
  it("cleans side points", () => {
    expect(normalizePoints([" Lime ", "", 3, "Gold line art"])).toEqual(["Lime", "Gold line art"]);
  });
});
