/** Bonus point rules (EMMA Rulebook 2026). Personal estimate only. */

export type BonusMode = "limited" | "unlimited";
export type Execution = 0 | 1 | 2;

export const BONUS_MODES: Record<BonusMode, { label: string; maxRequests: number; cap: number }> = {
  limited: { label: "Limited", maxRequests: 20, cap: 15 },
  unlimited: { label: "Unlimited", maxRequests: 50, cap: 100 },
};

export const DEFAULT_BONUS_MODE: BonusMode = "unlimited";

export const EXECUTION_LABELS: Record<Execution, string> = {
  0: "None",
  1: "Avg +1",
  2: "Good +2",
};

export const MAX_PER_REQUEST = 3;

export const BONUS_ELEMENTS = [
  { key: "A", title: "Highlight components", body: "An extraordinary way of showing the components used." },
  { key: "B", title: "Attract spectators", body: "Visual appeal, not loud noise." },
  { key: "C", title: "Normal everyday use", body: "Extra effort so the car keeps its everyday function." },
  { key: "D", title: "Creative presentation", body: "A creative way of presenting the system to the public." },
] as const;

export type BonusEstimateInput = { idea: boolean; execution: number; submit?: boolean };

/** Points for one request: 1 for the idea + 0/1/2 for execution, max 3. */
export function requestPoints(r: BonusEstimateInput): number {
  const exec = Math.max(0, Math.min(2, Math.trunc(Number(r.execution) || 0)));
  return Math.min(MAX_PER_REQUEST, (r.idea ? 1 : 0) + exec);
}

/**
 * Estimate for a class. Only rows ticked "Submit" count; at most `maxRequests`
 * of them (in list order), and the total is capped by the class.
 */
export function estimateBonus(requests: readonly BonusEstimateInput[], mode: BonusMode) {
  const { cap, maxRequests } = BONUS_MODES[mode];
  const submitted = requests.filter((r) => r.submit !== false);
  const counted = submitted.slice(0, maxRequests);
  const raw = counted.reduce((s, r) => s + requestPoints(r), 0);
  return {
    raw,
    score: Math.min(raw, cap),
    cap,
    maxRequests,
    candidates: requests.length,
    submitted: submitted.length,
    /** More rows listed than the class allows: pick the strongest with Submit. */
    tooManyCandidates: requests.length > maxRequests,
    /** More rows ticked than the class allows: the extra ones are ignored. */
    overSubmitted: submitted.length > maxRequests,
  };
}
