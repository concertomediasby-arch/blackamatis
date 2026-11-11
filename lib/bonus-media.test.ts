import { describe, expect, it } from "vitest";
import { normalizeMedia, youtubeId } from "./bonus-media";

describe("bonus media", () => {
  it("keeps valid items and fills safe defaults", () => {
    expect(normalizeMedia(null)).toEqual([]);
    expect(normalizeMedia([{ kind: "video", url: " https://youtu.be/abcdefghijk ", caption: "Step 1" }, "x", { path: "a.webp" }])).toEqual([
      { id: "m0", kind: "video", path: null, url: "https://youtu.be/abcdefghijk", caption: "Step 1" },
      { id: "m2", kind: "photo", path: "a.webp", url: null, caption: "" },
    ]);
  });

  it("reads YouTube ids from common link forms", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=abcdefghijk&t=3")).toBe("abcdefghijk");
    expect(youtubeId("https://youtu.be/abcdefghijk")).toBe("abcdefghijk");
    expect(youtubeId("https://youtube.com/shorts/abcdefghijk")).toBe("abcdefghijk");
    expect(youtubeId("https://www.instagram.com/reel/xyz/")).toBeNull();
    expect(youtubeId("not a url")).toBeNull();
  });
});
