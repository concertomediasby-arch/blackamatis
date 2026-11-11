/**
 * EMMA installation matrix (EMMA Install Judge Book 2026).
 * Max points per class; `null` = not judged in that class.
 * Do not change without a newer rulebook.
 */

export const CLASSES = ["E", "S", "M", "X", "XU"] as const;
export type EmmaClass = (typeof CLASSES)[number];

export const CLASS_INFO: Record<EmmaClass, { label: string; name: string; note: string }> = {
  E: { label: "E", name: "Entry", note: "Entry: basic safety, cleanliness and presentation items." },
  S: {
    label: "S",
    name: "Skilled",
    note: "Skilled: adds component fusing, fuse ratings, invisible wiring and normal use.",
  },
  M: {
    label: "M",
    name: "Master",
    note: "Master: full documentation, explanation to judges and craftsmanship.",
  },
  X: {
    label: "X",
    name: "Expert",
    note: "Expert: 50-point craftsmanship, interior & trunk design, bonus up to 15.",
  },
  XU: {
    label: "X Unl",
    name: "Expert Unlimited",
    note: "Expert Unlimited: 15-minute explanation, overall design, bonus up to 100.",
  },
};

export type CriterionKey =
  | "presentation_public"
  | "bonus_presentation"
  | "cleanliness"
  | "system_diagram"
  | "system_documentation"
  | "explanation"
  | "main_fuse"
  | "all_wires_fused"
  | "fuse_value"
  | "wires_invisible"
  | "wires_terminated"
  | "terminations_protected"
  | "wires_protected"
  | "securely_mounted"
  | "speaker_protection"
  | "normal_use"
  | "first_impression"
  | "craftsmanship"
  | "design_interior"
  | "design_trunk"
  | "design_overall"
  | "bonus_points";

type Row = readonly [CriterionKey, readonly [number | null, number | null, number | null, number | null, number | null]];

const _ = null;

/** Rows in judge-book order; columns follow CLASSES (E, S, M, X, XU). */
export const MATRIX_ROWS: readonly Row[] = [
  ["presentation_public", [10, 10, 10, 10, 10]],
  ["bonus_presentation", [_, _, 5, 5, 5]],
  ["cleanliness", [6, 6, 6, 6, 6]],
  ["system_diagram", [4, 4, _, _, _]],
  ["system_documentation", [_, _, 10, 10, 10]],
  ["explanation", [_, _, 5, 10, 10]],
  ["main_fuse", [10, 10, 10, 10, 10]],
  ["all_wires_fused", [_, 15, 15, 15, 15]],
  ["fuse_value", [_, 20, 20, 20, 20]],
  ["wires_invisible", [_, 5, 5, 5, 5]],
  ["wires_terminated", [_, _, 5, 5, 5]],
  ["terminations_protected", [_, _, 10, 10, 10]],
  ["wires_protected", [_, _, 5, 5, 5]],
  ["securely_mounted", [24, 24, 24, 24, 24]],
  ["speaker_protection", [5, 5, 5, 5, _]],
  ["normal_use", [_, 6, 6, 6, _]],
  ["first_impression", [10, 10, 10, 10, 10]],
  ["craftsmanship", [_, _, 10, 50, 50]],
  ["design_interior", [_, _, _, 5, 10]],
  ["design_trunk", [_, _, _, 5, 10]],
  ["design_overall", [_, _, _, _, 10]],
  ["bonus_points", [_, _, _, 15, 100]],
];

/** Official totals from the judge book. */
export const CLASS_TOTALS: Record<EmmaClass, number> = { E: 69, S: 115, M: 161, X: 231, XU: 325 };

export function maxPoints(key: CriterionKey, cls: EmmaClass): number | null {
  const row = MATRIX_ROWS.find((r) => r[0] === key);
  if (!row) return null;
  return row[1][CLASSES.indexOf(cls)];
}

export function columnSum(cls: EmmaClass): number {
  const i = CLASSES.indexOf(cls);
  return MATRIX_ROWS.reduce((sum, [, pts]) => sum + (pts[i] ?? 0), 0);
}

export function judgedKeys(cls: EmmaClass): CriterionKey[] {
  const i = CLASSES.indexOf(cls);
  return MATRIX_ROWS.filter(([, pts]) => pts[i] !== null).map(([k]) => k);
}

export function isEmmaClass(v: unknown): v is EmmaClass {
  return typeof v === "string" && (CLASSES as readonly string[]).includes(v);
}
