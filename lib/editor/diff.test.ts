import { describe, expect, it } from "vitest";
import { rowChanges, vehiclePatch } from "./diff";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";

describe("vehiclePatch", () => {
  it("returns only the fields this editor changed", () => {
    const base = { id: A, class: "X", name: "Black Amethyst", motifs: [{ id: "m" }], updated_at: "t1", status: "published" };
    const cur = { ...base, name: "Black Amethyst!", motifs: [{ id: "m" }], updated_at: "t2" };
    expect(vehiclePatch(cur, base)).toEqual({ name: "Black Amethyst!" });
    expect(vehiclePatch(base, base)).toEqual({});
  });
});

describe("rowChanges", () => {
  it("writes edited and new rows, deletes only rows removed here", () => {
    const base = [
      { id: A, title: "a", status: "published", updated_at: "t1" },
      { id: B, title: "b", status: "published", updated_at: "t1" },
    ];
    const current = [
      { id: A, title: "a", status: "published", updated_at: "t1" }, // untouched
      { id: C, title: "new", status: "draft", updated_at: "" }, // added here
    ];
    const r = rowChanges(current, base);
    expect(r.write.map((x) => x.id)).toEqual([C]);
    expect(r.remove).toEqual([B]);
  });

  it("ignores bookkeeping columns and leaves rows it never knew alone", () => {
    const base = [{ id: A, title: "a", updated_at: "t1" }];
    const current = [{ id: A, title: "a", updated_at: "t9" }];
    expect(rowChanges(current, base)).toEqual({ write: [], remove: [] });
    // A row created elsewhere (not in base, not here) is neither written nor deleted.
    expect(rowChanges([], [])).toEqual({ write: [], remove: [] });
  });

  it("always writes rows with placeholder ids (not yet in the database)", () => {
    const base = [{ id: "z-1", name: "Exterior" }];
    const r = rowChanges([{ id: "z-1", name: "Exterior" }], base);
    expect(r.write.map((x) => x.id)).toEqual(["z-1"]);
    expect(r.remove).toEqual([]);
  });
});
