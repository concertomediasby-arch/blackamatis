import { describe, expect, it } from "vitest";
import { fillTextNulls } from "./content";

describe("loading rows with null text", () => {
  it("turns null text columns into empty strings, leaves other nulls", () => {
    const template = { id: "x", description: "[...]", photo_path: null, sort: 1 };
    const rows = [{ id: "a", description: null, photo_path: null, sort: 2 }, { id: "b", description: "Idea", photo_path: "p.webp", sort: 3 }];
    expect(fillTextNulls(rows, template)).toEqual([
      { id: "a", description: "", photo_path: null, sort: 2 },
      { id: "b", description: "Idea", photo_path: "p.webp", sort: 3 },
    ]);
    expect(fillTextNulls(rows, undefined)).toBe(rows);
  });
});
