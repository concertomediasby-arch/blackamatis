import { describe, expect, it } from "vitest";
import { homeStats } from "./home-stats";

const comp = (key: string, type: string) => ({ key, type }) as never;
const run = (id: string, kind: string, component_key: string | null, fuse: boolean) =>
  ({ id, kind, component_key, power: fuse ? [{ t: "node", label: "Fuse", fuse_a: 100 }] : [] }) as never;

describe("landing key numbers", () => {
  it("counts amplifiers, circuits and fused circuits from the data", () => {
    const s = homeStats({
      vehicle: { class: "XU" } as never,
      components: [comp("amp_a", "amplifier"), comp("dsp", "dsp")],
      circuits: [run("t", "trunk", null, true), run("a", "channel", "amp_a", true), run("b", "channel", "amp_a", true), run("d", "channel", "dsp", true), run("e", "channel", null, false)],
    });
    expect(s).toEqual(["EXPERT UNLIMITED", "2 amplifiers", "4 circuits", "3 fused circuits"]);
  });

  it("shows only the class when there are no circuits yet", () => {
    expect(homeStats({ vehicle: { class: "X" } as never, components: [], circuits: [] })).toEqual(["EXPERT"]);
  });
});
