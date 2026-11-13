import { describe, expect, it } from "vitest";
import { BONUS_MEDIA_LIMITS, mediaCounts, normalizeMedia, youtubeId } from "./bonus-media";

describe("bonus media", () => {
  it("keeps valid items and fills safe defaults", () => {
    expect(normalizeMedia(null)).toEqual([]);
    expect(normalizeMedia([{ kind: "video", url: " https://youtu.be/abcdefghijk ", caption: "Step 1" }, "x", { path: "a.webp" }])).toEqual([
      { id: "m0", kind: "video", path: null, url: "https://youtu.be/abcdefghijk", caption: "Step 1" },
      { id: "m2", kind: "photo", path: "a.webp", url: null, caption: "" },
    ]);
  });

  it("keeps a photo's position & size, clamped, and adds none when absent", () => {
    const [a, b] = normalizeMedia([
      { id: "a", path: "h/a.webp", layout: { x: 80, y: -5, scale: 130 } },
      { id: "b", path: "h/b.webp" },
    ]);
    expect(a.layout).toEqual({ x: 50, y: -5, scale: 130 });
    expect("layout" in b).toBe(false);
  });

  it("reads YouTube ids from common link forms", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=abcdefghijk&t=3")).toBe("abcdefghijk");
    expect(youtubeId("https://youtu.be/abcdefghijk")).toBe("abcdefghijk");
    expect(youtubeId("https://youtube.com/shorts/abcdefghijk")).toBe("abcdefghijk");
    expect(youtubeId("https://www.instagram.com/reel/xyz/")).toBeNull();
    expect(youtubeId("not a url")).toBeNull();
  });
});

describe("bonus media limits", () => {
  it("counts photos and videos", () => {
    const m = (kind: "photo" | "video") => ({ id: kind + Math.random(), kind, path: null, url: null, caption: "" });
    expect(mediaCounts([m("photo"), m("video"), m("photo")])).toEqual({ photo: 2, video: 1 });
    expect(mediaCounts([])).toEqual({ photo: 0, video: 0 });
    expect(BONUS_MEDIA_LIMITS).toEqual({ photo: 3, video: 1 });
  });
});
