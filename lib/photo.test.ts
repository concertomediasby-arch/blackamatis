import { describe, expect, it } from "vitest";
import { cropRect, cropStyle, focusForCentre, heroTransform, photoAspect, normalizeCarLayout, normalizeHotspots, objectPosition, photoZoom, splitPhoto, spotFromDrag, withCrop, withFocus } from "./photo";

describe("photo focus point", () => {
  it("reads the focus fragment and strips it from the path", () => {
    expect(splitPhoto("photos/a.webp#fp=30,70")).toEqual({ path: "photos/a.webp", focus: { x: 30, y: 70 } });
    expect(splitPhoto("photos/a.webp")).toEqual({ path: "photos/a.webp", focus: null });
    expect(splitPhoto(null)).toEqual({ path: null, focus: null });
  });

  it("clamps out-of-range values", () => {
    expect(splitPhoto("a.webp#fp=150,-20").focus).toEqual({ x: 100, y: 0 });
  });

  it("writes the fragment, and drops it when centred", () => {
    expect(withFocus("a.webp", { x: 12.4, y: 80 })).toBe("a.webp#fp=12,80");
    expect(withFocus("a.webp#fp=12,80", { x: 50, y: 50 })).toBe("a.webp");
    expect(withFocus("a.webp#fp=12,80", null)).toBe("a.webp");
    expect(withFocus(null, { x: 1, y: 1 })).toBeNull();
  });

  it("works with data URLs used in preview mode", () => {
    const d = "data:image/webp;base64,AAAA";
    expect(splitPhoto(withFocus(d, { x: 20, y: 30 }))).toEqual({ path: d, focus: { x: 20, y: 30 } });
  });

  it("maps focus to CSS object-position", () => {
    expect(objectPosition({ x: 30, y: 70 })).toBe("30% 70%");
    expect(objectPosition(null)).toBeUndefined();
  });
});

describe("hero car layout", () => {
  it("fills defaults and clamps", () => {
    expect(normalizeCarLayout(null)).toEqual({ desktop: { x: 0, y: 0, scale: 100 }, mobile: { x: 0, y: 0, scale: 100 } });
    expect(normalizeCarLayout({ desktop: { x: 80, y: -10.6, scale: 400 }, mobile: { scale: 10 } })).toEqual({
      desktop: { x: 50, y: -11, scale: 200 },
      mobile: { x: 0, y: 0, scale: 50 },
    });
  });

  it("builds the CSS transform", () => {
    expect(heroTransform({ x: -10, y: 5, scale: 120 })).toBe("translate(-10%, 5%) scale(1.2)");
  });
});


describe("diagram hotspots", () => {
  it("drops invalid entries and keeps areas inside the image", () => {
    expect(normalizeHotspots(null)).toEqual([]);
    expect(normalizeHotspots([{ x: 10, y: 20, w: 5, h: 5 }, { x: "a" }, null])).toEqual([{ x: 10, y: 20, w: 5, h: 5 }]);
    expect(normalizeHotspots([{ x: 98, y: -5, w: 30, h: 0.2 }])).toEqual([{ x: 98, y: 0, w: 2, h: 1 }]);
  });

  it("builds an area from a drag in any direction", () => {
    expect(spotFromDrag({ x: 40, y: 50 }, { x: 30, y: 35 })).toEqual({ x: 30, y: 35, w: 10, h: 15 });
    expect(spotFromDrag({ x: 40, y: 50 }, { x: 40.5, y: 51 })).toBeNull();
  });
});

describe("photo crop (focus + zoom)", () => {
  it("reads and writes the zoom next to the focus", () => {
    expect(photoZoom("a.webp")).toBe(100);
    expect(photoZoom("a.webp#fp=10,20&z=150")).toBe(150);
    expect(photoZoom("a.webp#z=900")).toBe(300);
    expect(splitPhoto("a.webp#fp=10,20&z=150")).toEqual({ path: "a.webp", focus: { x: 10, y: 20 } });
    expect(withCrop("a.webp", { x: 10, y: 20 }, 150)).toBe("a.webp#fp=10,20&z=150");
    expect(withCrop("a.webp#fp=10,20&z=150", { x: 50, y: 50 }, 180)).toBe("a.webp#z=180");
    expect(withCrop("a.webp#fp=10,20&z=150", null, 100)).toBe("a.webp");
    expect(withFocus("a.webp#z=150", { x: 30, y: 40 })).toBe("a.webp#fp=30,40&z=150");
  });

  it("zooms around the focus point", () => {
    expect(cropStyle("a.webp")).toEqual({ objectPosition: undefined });
    expect(cropStyle("a.webp#fp=30,40")).toEqual({ objectPosition: "30% 40%" });
    expect(cropStyle("a.webp#fp=30,40&z=200")).toEqual({ objectPosition: "30% 40%", transform: "scale(2)", transformOrigin: "30% 40%" });
    expect(cropStyle("a.webp#z=150").transformOrigin).toBe("50% 50%");
  });

  it("works out the visible part of the photo", () => {
    // 2:1 photo in a square frame: half the width shows, centred.
    expect(cropRect(2, 1, null)).toEqual({ x: 25, y: 0, w: 50, h: 100 });
    expect(cropRect(2, 1, { x: 0, y: 50 })).toEqual({ x: 0, y: 0, w: 50, h: 100 });
    // Zoom 200 %: a quarter of the width, half the height.
    expect(cropRect(2, 1, { x: 100, y: 100 }, 200)).toEqual({ x: 75, y: 50, w: 25, h: 50 });
  });

  it("centres the frame where the editor clicks", () => {
    expect(focusForCentre(2, 1, 100, 25, 50, null)).toEqual({ x: 0, y: 50 });
    expect(focusForCentre(2, 1, 100, 50, 10, { x: 50, y: 70 })).toEqual({ x: 50, y: 70 });
    expect(focusForCentre(2, 1, 200, 50, 50, null)).toEqual({ x: 50, y: 50 });
  });
});

describe("photo crop shape", () => {
  it("stores the chosen frame shape with the crop", () => {
    expect(withCrop("a.webp", { x: 47, y: 54 }, 100, { w: 16, h: 9 })).toBe("a.webp#fp=47,54&a=16x9");
    expect(photoAspect("a.webp#fp=47,54&a=16x9")).toEqual({ w: 16, h: 9 });
    expect(photoAspect("a.webp#fp=47,54")).toBeNull();
    expect(withFocus("a.webp#z=150&a=1x1", { x: 20, y: 20 })).toBe("a.webp#fp=20,20&z=150&a=1x1");
    expect(photoZoom("a.webp#a=4x3&z=120")).toBe(120);
    expect(splitPhoto("a.webp#fp=1,2&a=4x3").focus).toEqual({ x: 1, y: 2 });
  });
});
