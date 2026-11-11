import { describe, expect, it } from "vitest";
import type { WiringLink } from "../types";
import { circuitOf } from "./circuit";

const L = (from_key: string, to_key: string, cable_mm2: number | null, fuse_a: number | null): WiringLink => ({ id: `${from_key}>${to_key}`, from_key, to_key, cable_mm2, fuse_a });
const links = [L("battery", "main_fuse", 50, 250), L("main_fuse", "dist", 35, 175), L("dist", "amp_a", 6, 50), L("dist", "amp_b", 4, 60), L("dist", "dsp", null, 10)];

describe("circuit of a component", () => {
  it("walks upstream to the power source", () => {
    const c = circuitOf("amp_a", links);
    expect(c.path.map((s) => s.key)).toEqual(["battery", "main_fuse", "dist", "amp_a"]);
    expect(c.path[0].in).toBeNull();
    expect(c.path[3].in?.check).toEqual({ status: "ok", maxA: 50 });
    expect(c.status).toBe("ok");
  });

  it("flags a fuse above VW75212 for its cable", () => {
    expect(circuitOf("amp_b", links).status).toBe("over"); // 4 mm² allows 30 A
  });

  it("reports missing cable or fuse values", () => {
    expect(circuitOf("dsp", links).status).toBe("incomplete");
  });

  it("lists the outputs of a distribution block", () => {
    const c = circuitOf("dist", links);
    expect(c.feeds.map((f) => f.link.to_key)).toEqual(["amp_a", "amp_b", "dsp"]);
    expect(c.status).toBe("over");
  });

  it("handles unlinked devices and loops", () => {
    expect(circuitOf("tweeter", links)).toMatchObject({ path: [{ key: "tweeter", in: null }], feeds: [], status: "unlinked" });
    const loop = circuitOf("a", [L("a", "b", 1, 10), L("b", "a", 1, 10)]);
    expect(loop.path.map((s) => s.key)).toEqual(["b", "a"]);
    expect(loop.path[0].in).toBeNull();
  });
});
