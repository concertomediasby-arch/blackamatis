import type { ChainItem } from "../types";
import { MAIN_FUSE_MAX_CM, maxFuseForAwg } from "./fuses";

export type CableCheck =
  /** Before the first fuse: the main-fuse distance rule applies (from the battery post). */
  | { kind: "distance"; ok: boolean | null; maxCm: number }
  /** Protected by the nearest fuse upstream, checked against VW75212 for this cable. */
  | { kind: "fuse"; fuseA: number | null; maxA: number | null; ok: boolean | null }
  /** Not part of a fused run (e.g. a ground cable). */
  | { kind: "none" };

export type AnalysedItem = ChainItem & { check?: CableCheck };

/**
 * Walk a power run from the battery: every cable is checked against the nearest
 * fuse before it (VW75212, smallest cable rules), and cables before the first
 * fuse against the 40 cm main-fuse rule.
 */
export function analyseChain(items: readonly ChainItem[], fused = true): AnalysedItem[] {
  // undefined: no fuse yet; null: a fuse whose rating is not filled in.
  let fuse: number | null | undefined = undefined;
  return items.map((it) => {
    if (it.t === "node") {
      if (it.fuse_a != null || it.is_fuse) fuse = it.fuse_a ?? null;
      return it;
    }
    if (!fused) return { ...it, check: { kind: "none" } };
    if (fuse === undefined) return { ...it, check: { kind: "distance", ok: it.length_cm == null ? null : it.length_cm <= MAIN_FUSE_MAX_CM, maxCm: MAIN_FUSE_MAX_CM } };
    const maxA = maxFuseForAwg(it.awg);
    return { ...it, check: { kind: "fuse", fuseA: fuse, maxA, ok: maxA === null || fuse === null ? null : fuse <= maxA } };
  });
}

/** Overall result of analysed runs: any failure wins, then anything unknown. */
export function chainStatus(...runs: AnalysedItem[][]): "ok" | "over" | "incomplete" | "empty" {
  const checks = runs.flat().flatMap((i) => (i.t === "cable" && i.check && i.check.kind !== "none" ? [i.check] : []));
  if (checks.length === 0) return "empty";
  if (checks.some((c) => c.ok === false)) return "over";
  if (checks.some((c) => c.ok === null)) return "incomplete";
  return "ok";
}
