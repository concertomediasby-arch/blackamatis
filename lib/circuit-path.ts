import type { Hotspot } from "./photo";
import type { Circuit, PathPart } from "./types";

export type PathMark = Hotspot & {
  key: string;
  label: string;
  /** "device": the circuit's own device; otherwise the run the part is on. */
  kind: "device" | PathPart["run"];
};

const same = (a: Hotspot, b: Hotspot) =>
  a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

/**
 * Everything to light up on the cable diagram for one circuit: the parts of
 * the main run(s) it continues from (+ parts from its power trunk, − parts
 * from its ground trunk, shared parts from both), its own parts (fuse holder,
 * ground terminal) and the device itself. A box marked twice shows once.
 */
export function pathMarks(c: Circuit, circuits: Circuit[]): PathMark[] {
  const trunk = (id: string | null) =>
    c.kind === "channel" && id
      ? circuits.find((x) => x.id === id && x.kind === "trunk")
      : undefined;
  const tp = trunk(c.power_from);
  const tg = trunk(c.ground_from);
  const parts: PathPart[] = [
    ...(tp?.parts.filter((p) => p.run !== "ground") ?? []),
    ...(tg?.parts.filter((p) => p.run !== "power") ?? []),
    ...c.parts,
  ];
  const out: PathMark[] = [];
  parts.forEach((p) => {
    const dup = out.find((m) => same(m, p));
    if (dup) {
      if (dup.kind !== p.run) dup.kind = "both";
      return;
    }
    out.push({
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      key: `p-${p.id}-${out.length}`,
      label: p.label,
      kind: p.run,
    });
  });
  c.wiring_hotspots.forEach((s, i) => {
    if (!out.some((m) => same(m, s)))
      out.push({ ...s, key: `d-${i}`, label: c.name, kind: "device" });
  });
  return out;
}

/** Click areas of every circuit, main runs first so a device's own boxes sit on top; a box already taken is skipped. */
export function clickAreas(
  circuits: Circuit[],
): { circuit: Circuit; box: Hotspot; key: string }[] {
  const ordered = [
    ...circuits.filter((c) => c.kind === "trunk"),
    ...circuits.filter((c) => c.kind !== "trunk"),
  ];
  const out: { circuit: Circuit; box: Hotspot; key: string }[] = [];
  for (const c of ordered) {
    [...c.wiring_hotspots, ...c.parts].forEach((b, i) => {
      if (out.some((o) => same(o.box, b))) return;
      out.push({
        circuit: c,
        box: { x: b.x, y: b.y, w: b.w, h: b.h },
        key: `${c.id}-${i}`,
      });
    });
  }
  return out;
}

/** True when box a lies inside box b (used to put a tag under a part that sits inside a bigger one). */
export const inside = (a: Hotspot, b: Hotspot) =>
  a !== b &&
  a.x >= b.x &&
  a.y >= b.y &&
  a.x + a.w <= b.x + b.w &&
  a.y + a.h <= b.y + b.h &&
  !same(a, b);
