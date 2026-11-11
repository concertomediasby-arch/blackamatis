import type { Motif } from "./types";

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/** Accepts anything from the database and returns valid motifs (point inside the photo). */
export function normalizeMotifs(v: unknown): Motif[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((raw, i): Motif[] => {
    if (!raw || typeof raw !== "object") return [];
    const o = raw as Record<string, unknown>;
    const n = (k: string) => (typeof o[k] === "number" && Number.isFinite(o[k]) ? (o[k] as number) : 50);
    const s = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
    return [{ id: s("id") || `m${i}`, title: s("title"), meaning: s("meaning"), x: Math.round(clamp(n("x")) * 10) / 10, y: Math.round(clamp(n("y")) * 10) / 10 }];
  });
}

/** Short points of one side: text only, trimmed, empty ones dropped. */
export function normalizePoints(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean) : [];
}
