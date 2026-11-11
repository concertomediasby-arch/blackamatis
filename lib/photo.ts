/**
 * Photo positioning.
 *
 * Focus point: stored as a fragment on the photo path, e.g. "photos/a.webp#fp=30,70"
 * (x%, y%). Cropped photos (object-fit: cover) keep that point in view. The fragment
 * is stripped before building the file URL, so it works for every table.
 *
 * Hero car layout: offset (% of the car box) and size (%), separately for desktop
 * and phone, stored on vehicle.car_photo_layout.
 */

export type Focus = { x: number; y: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function splitPhoto(path: string | null | undefined): { path: string | null; focus: Focus | null } {
  if (!path) return { path: null, focus: null };
  const hash = path.indexOf("#");
  if (hash < 0) return { path, focus: null };
  const base = path.slice(0, hash);
  const m = /(?:^|&)fp=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(path.slice(hash + 1));
  return { path: base || null, focus: m ? { x: clamp(Math.round(Number(m[1])), 0, 100), y: clamp(Math.round(Number(m[2])), 0, 100) } : null };
}

/** Path with the focus fragment set (or removed when focus is null or centred). */
export function withFocus(path: string | null, focus: Focus | null): string | null {
  const { path: base } = splitPhoto(path);
  if (!base) return null;
  if (!focus || (focus.x === 50 && focus.y === 50)) return base;
  return `${base}#fp=${clamp(Math.round(focus.x), 0, 100)},${clamp(Math.round(focus.y), 0, 100)}`;
}

export const objectPosition = (focus: Focus | null) => (focus ? `${focus.x}% ${focus.y}%` : undefined);

export type HeroLayout = { x: number; y: number; scale: number };
export type CarPhotoLayout = { desktop: HeroLayout; mobile: HeroLayout };

export const LAYOUT_LIMITS = { offset: 50, minScale: 50, maxScale: 200 } as const;
export const DEFAULT_HERO_LAYOUT: HeroLayout = { x: 0, y: 0, scale: 100 };
export const DEFAULT_CAR_LAYOUT: CarPhotoLayout = { desktop: DEFAULT_HERO_LAYOUT, mobile: DEFAULT_HERO_LAYOUT };

function normalizeOne(v: unknown): HeroLayout {
  const o = (v && typeof v === "object" ? v : {}) as Partial<Record<keyof HeroLayout, unknown>>;
  const num = (x: unknown, d: number) => (typeof x === "number" && Number.isFinite(x) ? x : d);
  return {
    x: clamp(Math.round(num(o.x, 0)), -LAYOUT_LIMITS.offset, LAYOUT_LIMITS.offset),
    y: clamp(Math.round(num(o.y, 0)), -LAYOUT_LIMITS.offset, LAYOUT_LIMITS.offset),
    scale: clamp(Math.round(num(o.scale, 100)), LAYOUT_LIMITS.minScale, LAYOUT_LIMITS.maxScale),
  };
}

/** Accepts anything from the database and returns a safe layout. */
export function normalizeCarLayout(v: unknown): CarPhotoLayout {
  const o = (v && typeof v === "object" ? v : {}) as Partial<Record<keyof CarPhotoLayout, unknown>>;
  return { desktop: normalizeOne(o.desktop), mobile: normalizeOne(o.mobile) };
}

export const heroTransform = (l: HeroLayout) => `translate(${l.x}%, ${l.y}%) scale(${l.scale / 100})`;
