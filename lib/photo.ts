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

export const ZOOM_LIMITS = { min: 100, max: 300 } as const;

/** Crop zoom stored on the path ("#…&z=150"), in % (100 = no extra crop). */
export function photoZoom(path: string | null | undefined): number {
  const hash = path ? path.indexOf("#") : -1;
  if (!path || hash < 0) return 100;
  const m = /(?:^|&)z=(\d+(?:\.\d+)?)/.exec(path.slice(hash + 1));
  return m ? clamp(Math.round(Number(m[1])), ZOOM_LIMITS.min, ZOOM_LIMITS.max) : 100;
}

/** Frame shape chosen in Crop & position ("#…&a=16x9"): the large view shows the photo cut to it. */
export type Aspect = { w: number; h: number };

export function photoAspect(path: string | null | undefined): Aspect | null {
  const hash = path ? path.indexOf("#") : -1;
  if (!path || hash < 0) return null;
  const m = /(?:^|&)a=(\d{1,2})x(\d{1,2})/.exec(path.slice(hash + 1));
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  return w > 0 && h > 0 ? { w, h } : null;
}

/** Path with the crop set: focus point (object-position), zoom and frame shape. Centred / 100 % / no shape leave the path plain. */
export function withCrop(path: string | null, focus: Focus | null, zoom = 100, aspect: Aspect | null = null): string | null {
  const { path: base } = splitPhoto(path);
  if (!base) return null;
  const parts: string[] = [];
  if (focus && !(Math.round(focus.x) === 50 && Math.round(focus.y) === 50))
    parts.push(`fp=${clamp(Math.round(focus.x), 0, 100)},${clamp(Math.round(focus.y), 0, 100)}`);
  const z = clamp(Math.round(zoom), ZOOM_LIMITS.min, ZOOM_LIMITS.max);
  if (z > 100) parts.push(`z=${z}`);
  if (aspect) parts.push(`a=${aspect.w}x${aspect.h}`);
  return parts.length ? `${base}#${parts.join("&")}` : base;
}

/** Path with the focus fragment set (or removed when focus is null or centred); keeps the zoom. */
export function withFocus(path: string | null, focus: Focus | null): string | null {
  return withCrop(path, focus, photoZoom(path), photoAspect(path));
}

export const objectPosition = (focus: Focus | null) => (focus ? `${focus.x}% ${focus.y}%` : undefined);

/** CSS for a cropped (object-fit: cover) photo: its focus point, zoomed in around that point. */
export function cropStyle(path: string | null | undefined): { objectPosition?: string; transform?: string; transformOrigin?: string } {
  const { focus } = splitPhoto(path);
  const z = photoZoom(path);
  const pos = objectPosition(focus) ?? (z > 100 ? "50% 50%" : undefined);
  return z > 100 ? { objectPosition: pos, transform: `scale(${z / 100})`, transformOrigin: pos } : { objectPosition: pos };
}

/** Width / height of the visible part (fractions of the photo) in a frame, cover-fitted and zoomed. */
function cropSize(imageRatio: number, frameRatio: number, zoom: number) {
  const z = Math.max(1, zoom / 100);
  return { w: 1 / (z * Math.max(1, imageRatio / frameRatio)), h: 1 / (z * Math.max(1, frameRatio / imageRatio)) };
}

/** The part of the photo a frame shows, in % of the photo (x, y = top left). */
export function cropRect(imageRatio: number, frameRatio: number, focus: Focus | null, zoom = 100) {
  const f = focus ?? { x: 50, y: 50 };
  const { w, h } = cropSize(imageRatio, frameRatio, zoom);
  const r = (v: number) => Math.round(v * 1000) / 10;
  return { x: r((f.x / 100) * (1 - w)), y: r((f.y / 100) * (1 - h)), w: r(w), h: r(h) };
}

/** Focus point that centres the frame on a point of the photo (cx, cy in %). */
export function focusForCentre(imageRatio: number, frameRatio: number, zoom: number, cx: number, cy: number, prev: Focus | null): Focus {
  const { w, h } = cropSize(imageRatio, frameRatio, zoom);
  const axis = (c: number, size: number, old: number) =>
    size >= 0.999 ? old : clamp(Math.round(((c / 100 - size / 2) / (1 - size)) * 100), 0, 100);
  const p = prev ?? { x: 50, y: 50 };
  return { x: axis(cx, w, p.x), y: axis(cy, h, p.y) };
}

export type HeroLayout = { x: number; y: number; scale: number };
export type CarPhotoLayout = { desktop: HeroLayout; mobile: HeroLayout };

export const LAYOUT_LIMITS = { offset: 50, minScale: 50, maxScale: 200 } as const;
export const DEFAULT_HERO_LAYOUT: HeroLayout = { x: 0, y: 0, scale: 100 };
export const DEFAULT_CAR_LAYOUT: CarPhotoLayout = { desktop: DEFAULT_HERO_LAYOUT, mobile: DEFAULT_HERO_LAYOUT };

/** Accepts anything from the database and returns a safe offset/size (also used for partner logos). */
export function normalizeLayout(v: unknown): HeroLayout {
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
  return { desktop: normalizeLayout(o.desktop), mobile: normalizeLayout(o.mobile) };
}

export const heroTransform = (l: HeroLayout) => `translate(${l.x}%, ${l.y}%) scale(${l.scale / 100})`;

/** A clickable area on the system diagram image, in percent of the image size. */
export type Hotspot = { x: number; y: number; w: number; h: number };

const MIN_SPOT = 1;

/** Accepts anything from the database and returns valid areas inside the image. */
export function normalizeHotspots(v: unknown): Hotspot[] {
  if (!Array.isArray(v)) return [];
  const out: Hotspot[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const n = (k: string) => (typeof o[k] === "number" && Number.isFinite(o[k]) ? (o[k] as number) : NaN);
    let x = n("x"), y = n("y"), w = n("w"), h = n("h");
    if ([x, y, w, h].some(Number.isNaN)) continue;
    x = clamp(x, 0, 100 - MIN_SPOT);
    y = clamp(y, 0, 100 - MIN_SPOT);
    w = clamp(w, MIN_SPOT, 100 - x);
    h = clamp(h, MIN_SPOT, 100 - y);
    const r = (v: number) => Math.round(v * 10) / 10;
    out.push({ x: r(x), y: r(y), w: r(w), h: r(h) });
  }
  return out;
}

/** Rectangle from two corner points (any drag direction), or null when too small. */
export function spotFromDrag(a: { x: number; y: number }, b: { x: number; y: number }): Hotspot | null {
  const x = clamp(Math.min(a.x, b.x), 0, 100);
  const y = clamp(Math.min(a.y, b.y), 0, 100);
  const w = clamp(Math.abs(a.x - b.x), 0, 100 - x);
  const h = clamp(Math.abs(a.y - b.y), 0, 100 - y);
  if (w < MIN_SPOT || h < MIN_SPOT) return null;
  return normalizeHotspots([{ x, y, w, h }])[0] ?? null;
}

/** Which uploaded diagram image an area belongs to: the system diagram or the cable / wiring diagram. */
export type HotspotField = "hotspots" | "wiring_hotspots";
