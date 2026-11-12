import { normalizeHotspots } from "./photo";
import type { ChainItem, Circuit, PathPart, SideCable } from "./types";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
const awg = (v: unknown) => {
  const s = (typeof v === "number" ? String(v) : str(v)).trim().replace(/\s*AWG$/i, "");
  return s ? s : null;
};
const arr = (v: unknown) => (Array.isArray(v) ? v : []);
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : null);
const idOf = (o: Record<string, unknown>, i: number, p: string) => str(o.id) || `${p}${i}`;

export function normalizeChain(v: unknown): ChainItem[] {
  return arr(v).flatMap((raw, i): ChainItem[] => {
    const o = obj(raw);
    if (!o) return [];
    if (o.t === "cable") return [{ id: idOf(o, i, "c"), t: "cable", name: str(o.name), awg: awg(o.awg), length_cm: num(o.length_cm) }];
    const fuse_a = num(o.fuse_a);
    return [{ id: idOf(o, i, "n"), t: "node", label: str(o.label), fuse_a, is_fuse: o.is_fuse === true || fuse_a !== null }];
  });
}

export function normalizeCables(v: unknown): SideCable[] {
  return arr(v).flatMap((raw, i): SideCable[] => {
    const o = obj(raw);
    if (!o) return [];
    const role = o.role === "signal" || o.role === "speaker" ? o.role : "other";
    return [{ id: idOf(o, i, "s"), role, from: str(o.from), to: str(o.to), to_key: str(o.to_key) || null, name: str(o.name), awg: awg(o.awg), length_cm: num(o.length_cm) }];
  });
}

export function normalizeParts(v: unknown): PathPart[] {
  return arr(v).flatMap((raw, i): PathPart[] => {
    const o = obj(raw);
    const box = o && normalizeHotspots([o])[0];
    if (!o || !box) return [];
    const run = o.run === "power" || o.run === "ground" ? o.run : "both";
    return [{ ...box, id: idOf(o, i, "p"), label: str(o.label), run }];
  });
}

/** Accepts a row from the database (or a draft) and returns a safe circuit. */
export function normalizeCircuit(c: Partial<Circuit> & { id: string }): Circuit {
  return {
    id: c.id,
    name: str(c.name),
    kind: c.kind === "trunk" ? "trunk" : "channel",
    fuse_code: str(c.fuse_code).trim() || null,
    component_key: str(c.component_key) || null,
    power_from: str(c.power_from) || null,
    ground_from: str(c.ground_from) || null,
    power: normalizeChain(c.power),
    ground: normalizeChain(c.ground),
    cables: normalizeCables(c.cables),
    wiring_hotspots: normalizeHotspots(c.wiring_hotspots),
    parts: normalizeParts(c.parts),
    sort: typeof c.sort === "number" ? c.sort : 0,
  };
}
