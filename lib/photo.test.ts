import { describe, expect, it } from "vitest";
import { heroTransform, normalizeCarLayout, objectPosition, splitPhoto, withFocus } from "./photo";

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
