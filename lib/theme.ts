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
    const photo = typeof o.photo === "number" && Number.isInteger(o.photo) && o.photo >= 0 ? o.photo : 0;
    return [{ id: s("id") || `m${i}`, title: s("title"), meaning: s("meaning"), x: Math.round(clamp(n("x")) * 10) / 10, y: Math.round(clamp(n("y")) * 10) / 10, photo }];
  });
}

/** The motif photos in order: `motif_photos`, or the older single `motif_photo_path`. */
export function motifPhotos(v: { motif_photos?: unknown; motif_photo_path?: string | null }): string[] {
  const list = Array.isArray(v.motif_photos) ? v.motif_photos.filter((p): p is string => typeof p === "string" && p.length > 0) : [];
  if (list.length) return list;
  return v.motif_photo_path ? [v.motif_photo_path] : [];
}

/** Short points of one side: text only, trimmed, empty ones dropped. */
export function normalizePoints(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean) : [];
}
