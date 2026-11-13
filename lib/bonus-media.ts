import { normalizeLayout } from "./photo";
import type { BonusMedia } from "./types";

/** Accepts anything from the database and returns valid media items. */
export function normalizeMedia(v: unknown): BonusMedia[] {
  if (!Array.isArray(v)) return [];
  const out: BonusMedia[] = [];
  v.forEach((raw, i) => {
    if (!raw || typeof raw !== "object") return;
    const o = raw as Record<string, unknown>;
    const str = (k: string) =>
      typeof o[k] === "string" && (o[k] as string).trim()
        ? (o[k] as string).trim()
        : null;
    out.push({
      id: str("id") ?? `m${i}`,
      kind: o.kind === "video" ? "video" : "photo",
      path: str("path"),
      url: str("url"),
      caption: str("caption") ?? "",
      ...(o.layout && typeof o.layout === "object"
        ? { layout: normalizeLayout(o.layout) }
        : {}),
    });
  });
  return out;
}

/** YouTube video id from a watch, short, shorts or embed link; null for anything else. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  const ok = (id: string | null | undefined) =>
    id && /^[\w-]{11}$/.test(id) ? id : null;
  if (host === "youtu.be") return ok(u.pathname.slice(1));
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") return ok(u.searchParams.get("v"));
    const m = /^\/(?:shorts|embed|live)\/([^/?#]+)/.exec(u.pathname);
    return ok(m?.[1]);
  }
  return null;
}

/** Bonus Point: at most 3 photos and 1 video in Process, and the same in Result. */
export const BONUS_MEDIA_LIMITS = { photo: 3, video: 1 } as const;
export type MediaLimits = { photo: number; video: number };

/** How many photos and videos a list holds. */
export function mediaCounts(items: BonusMedia[]): { photo: number; video: number } {
  return {
    photo: items.filter((m) => m.kind === "photo").length,
    video: items.filter((m) => m.kind === "video").length,
  };
}
