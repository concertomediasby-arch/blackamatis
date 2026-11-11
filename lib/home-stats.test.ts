import { describe, expect, it } from "vitest";
import { homeHighlights } from "./home-stats";

const comp = (key: string, title: string, type: string) => ({ key, title, type }) as never;
const run = (id: string, kind: string, component_key: string | null, fuse: boolean) =>
  ({ id, kind, component_key, power: fuse ? [{ t: "node", label: "Fuse", fuse_a: 100 }] : [] }) as never;

describe("landing key numbers", () => {
  it("counts amplifiers, circuits and fused circuits from the data", () => {
    const s = homeHighlights({
      vehicle: { class: "XU" } as never,
      components: [comp("amp_a", "Aurum", "amplifier"), comp("amp_b", "Tantalum", "amplifier"), comp("dsp", "DSP", "dsp")],
      circuits: [run("t", "trunk", null, true), run("a", "channel", "amp_a", true), run("b", "channel", "amp_b", true), run("d", "channel", "dsp", true), run("e", "channel", null, false)],
    });
    expect(s.map((h) => [h.title, h.note])).toEqual([
      ["Expert Unlimited", "EMMA 2026 class"],
      ["2 amplifiers", "Aurum · Tantalum"],
      ["4 circuits", "Every run on the cable diagram"],
      ["3 fused circuits", "Rated by the VW75212 table"],
    ]);
  });

  it("shows only the class when there are no circuits yet", () => {
    expect(homeHighlights({ vehicle: { class: "X" } as never, components: [], circuits: [] }).map((h) => h.title)).toEqual(["Expert"]);
  });
});
