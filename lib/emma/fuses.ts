/**
 * Fuse table (VW75212): the fuse rating is chosen by the smallest cable in the circuit.
 */
export type FuseRow = { mm2: number; awg: string; maxA: number };

export const FUSE_TABLE: readonly FuseRow[] = [
  { mm2: 0.5, awg: "20", maxA: 10 },
  { mm2: 1.0, awg: "17", maxA: 15 },
  { mm2: 1.5, awg: "15", maxA: 20 },
  { mm2: 2.5, awg: "13", maxA: 20 },
  { mm2: 4.0, awg: "11", maxA: 30 },
  { mm2: 6.0, awg: "9", maxA: 50 },
  { mm2: 10, awg: "7", maxA: 60 },
  { mm2: 16, awg: "5", maxA: 100 },
  { mm2: 25, awg: "4", maxA: 125 },
  { mm2: 35, awg: "2", maxA: 175 },
  { mm2: 50, awg: "0", maxA: 250 },
  { mm2: 70, awg: "2/0", maxA: 300 },
];

/**
 * Max fuse rating for a cable cross-section. A size between table rows is rated
 * as the next smaller listed size (conservative). Returns null below 0.5 mm².
 */
export function maxFuseForCable(mm2: number): number | null {
  if (!Number.isFinite(mm2) || mm2 < FUSE_TABLE[0].mm2) return null;
  let match: FuseRow = FUSE_TABLE[0];
  for (const row of FUSE_TABLE) {
    if (row.mm2 <= mm2 + 1e-9) match = row;
  }
  return match.maxA;
}

export type FuseCheck =
  | { status: "ok"; maxA: number }
  | { status: "over"; maxA: number }
  | { status: "unknown"; maxA: null };

/** Check a fuse against the smallest cable of its circuit. */
export function checkFuse(cableMm2: number | null | undefined, fuseA: number | null | undefined): FuseCheck {
  if (cableMm2 == null || fuseA == null) return { status: "unknown", maxA: null };
  const maxA = maxFuseForCable(cableMm2);
  if (maxA === null) return { status: "unknown", maxA: null };
  return fuseA > maxA ? { status: "over", maxA } : { status: "ok", maxA };
}

/** Main fuse must be within this distance of each positive battery post. */
export const MAIN_FUSE_MAX_CM = 40;
