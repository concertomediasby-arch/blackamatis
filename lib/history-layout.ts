/** How the History page places its headline and story (editor › Vehicle & Story › History layout). */
export type HistoryLayout = {
  /** Story beside the headline, or under it. */
  story: "beside" | "below";
  /** Where the block sits: left, centred, or headline left and story right ("spread"). */
  align: "start" | "center" | "spread";
  /** Headline and story aligned at their top or bottom (beside only). */
  valign: "start" | "end";
  /** Space between headline and story, px. */
  gap: number;
  /** Maximum width of the story, px. */
  width: number;
  /** Left / right page margin on tablets and wider, px. */
  margin: number;
};

export const HISTORY_LAYOUT_LIMITS = {
  gap: [16, 240],
  width: [360, 960],
  margin: [0, 200],
} as const;

export const DEFAULT_HISTORY_LAYOUT: HistoryLayout = {
  story: "beside",
  align: "start",
  valign: "end",
  gap: 80,
  width: 640,
  margin: 48,
};

const clamp = (v: unknown, [lo, hi]: readonly [number, number], d: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(hi, Math.max(lo, Math.round(v)))
    : d;

/** Accepts anything from the database and returns a safe layout. */
export function normalizeHistoryLayout(v: unknown): HistoryLayout {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const d = DEFAULT_HISTORY_LAYOUT;
  return {
    story: o.story === "below" ? "below" : "beside",
    align: o.align === "center" || o.align === "spread" ? o.align : "start",
    valign: o.valign === "start" ? "start" : "end",
    gap: clamp(o.gap, HISTORY_LAYOUT_LIMITS.gap, d.gap),
    width: clamp(o.width, HISTORY_LAYOUT_LIMITS.width, d.width),
    margin: clamp(o.margin, HISTORY_LAYOUT_LIMITS.margin, d.margin),
  };
}
