import { describe, expect, it } from "vitest";
import { layoutTree, popoverPosition } from "./diagram";

describe("layoutTree", () => {
  const keys = ["hu", "dsp", "amp_a", "amp_b", "tweeter", "mid", "midbass", "sub"];
  const edges = [
    { from: "hu", to: "dsp" },
    { from: "dsp", to: "amp_a" },
    { from: "dsp", to: "amp_b" },
    { from: "amp_a", to: "tweeter" },
    { from: "amp_a", to: "mid" },
    { from: "amp_a", to: "midbass" },
    { from: "amp_b", to: "sub" },
  ];

  it("places nodes in columns by depth", () => {
    const r = layoutTree(keys, edges);
    const d = Object.fromEntries(r.nodes.map((n) => [n.key, n.depth]));
    expect(d).toMatchObject({ hu: 0, dsp: 1, amp_a: 2, amp_b: 2, tweeter: 3, sub: 3 });
    expect(r.columns).toBe(4);
    expect(r.edges).toHaveLength(7);
  });

  it("centres a parent on its children", () => {
    const r = layoutTree(keys, edges);
    const n = Object.fromEntries(r.nodes.map((x) => [x.key, x]));
    const mid = (k: string) => n[k].y + n[k].h / 2;
    expect(mid("amp_a")).toBe((mid("tweeter") + mid("midbass")) / 2);
    expect(mid("amp_b")).toBe(mid("sub"));
  });

  it("supports a 2-way front stage (data-driven)", () => {
    const r = layoutTree(
      ["hu", "dsp", "amp_a", "tweeter", "midbass"],
      [
        { from: "hu", to: "dsp" },
        { from: "dsp", to: "amp_a" },
        { from: "amp_a", to: "tweeter" },
        { from: "amp_a", to: "midbass" },
      ],
    );
    expect(r.nodes).toHaveLength(5);
  });

  it("ignores edges to unknown nodes and survives cycles", () => {
    const r = layoutTree(["a", "b"], [
      { from: "a", to: "b" },
      { from: "b", to: "a" },
      { from: "a", to: "zz" },
    ]);
    expect(r.nodes.length).toBeLessThanOrEqual(2);
  });
});

describe("popoverPosition", () => {
  it("opens right when it fits, else left", () => {
    expect(popoverPosition({ x: 40, y: 100, w: 200 }, { w: 360, h: 400 }, { width: 1200, height: 600 }).side).toBe("right");
    const p = popoverPosition({ x: 980, y: 100, w: 200 }, { w: 360, h: 400 }, { width: 1200, height: 600 });
    expect(p.side).toBe("left");
    expect(p.left).toBe(980 - 16 - 360);
  });

  it("clamps vertically inside the diagram", () => {
    expect(popoverPosition({ x: 0, y: 500, w: 200 }, { w: 360, h: 400 }, { width: 1200, height: 600 }).top).toBe(192);
  });
});
