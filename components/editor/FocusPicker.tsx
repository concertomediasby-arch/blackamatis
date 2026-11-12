"use client";

/* eslint-disable @next/next/no-img-element -- plain <img> keeps the click position mapped 1:1 to the photo */
import { useId, useRef, useState } from "react";
import {
  cropRect,
  cropStyle,
  focusForCentre,
  photoShape,
  photoZoom,
  splitPhoto,
  withCrop,
  ZOOM_LIMITS,
  type Aspect,
  type PhotoShape,
  type Focus,
} from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";

/** Frame shapes (photo log 4:3, close-ups 3:4, gallery and thumbnails square, news 16:9). "Original" keeps the photo's own shape. */
const SHAPES: { label: string; a: Aspect | null }[] = [
  { label: "Original", a: null },
  { label: "Square", a: { w: 1, h: 1 } },
  { label: "Portrait 3:4", a: { w: 3, h: 4 } },
  { label: "4:3", a: { w: 4, h: 3 } },
  { label: "Wide 16:9", a: { w: 16, h: 9 } },
];
/** Tab shown when no shape is saved yet; any change then saves it. */
const DEFAULT_SHAPE = 3;
const shapeIndex = (saved: PhotoShape | null) => {
  if (!saved) return DEFAULT_SHAPE;
  if (saved === "original") return 0;
  const i = SHAPES.findIndex((x) => x.a && x.a.w * saved.h === x.a.h * saved.w);
  return i < 0 ? DEFAULT_SHAPE : i;
};
const toShape = (a: Aspect | null): PhotoShape => a ?? "original";

/**
 * Crop & position: drag the frame over the photo (or click where it should
 * centre), zoom in to crop tighter, or use the sliders. Stored on the photo
 * path (focus, zoom and the chosen shape), so the original file stays whole.
 * The large view (lightbox) shows the photo cut to the chosen shape; cards on
 * the page keep their own shape around the same point.
 */
export function FocusPicker({
  value,
  onChange,
  mode = "cover",
}: {
  value: string;
  onChange: (path: string | null) => void;
  /** "whole": the site shows the photo uncut in its box (logo, product): zoom and move it there. */
  mode?: "cover" | "whole";
}) {
  const whole = mode === "whole";
  const uid = useId();
  const imgRef = useRef<HTMLImageElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const { focus } = splitPhoto(value);
  const zoom = photoZoom(value);
  const shape = shapeIndex(photoShape(value));
  const f: Focus = focus ?? { x: 50, y: 50 };
  const url = storageUrl(value);
  if (!url) return null;

  const frameRatio = (a: Aspect | null) => (a ? a.w / a.h : (ratio ?? 1));
  const fr = frameRatio(SHAPES[shape].a);
  const rect = ratio ? cropRect(ratio, fr, f, zoom) : null;
  // Every change saves the shape in view too, so the large view shows what the frame shows.
  const set = (next: Focus, z = zoom, a: Aspect | null = SHAPES[shape].a) =>
    onChange(withCrop(value, next, z, whole ? null : toShape(a)));
  const fromPointer = (e: React.PointerEvent) => {
    const r = imgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0 || !ratio) return;
    const cx = ((e.clientX - r.left) / r.width) * 100;
    const cy = ((e.clientY - r.top) / r.height) * 100;
    set(
      whole
        ? { x: Math.round(cx), y: Math.round(cy) }
        : focusForCentre(ratio, fr, zoom, cx, cy, f),
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-editor-border bg-white p-4">
      {whole ? (
        <p className="m-0 text-sm text-[#4a4852]">
          This photo is shown whole in its box. Zoom in to trim empty space
          around it, and click (or drag) the point to zoom in on.
        </p>
      ) : (
        <p className="m-0 text-sm text-[#4a4852]">
          Pick a shape, drag the frame (or click) to choose what shows, and zoom
          in to crop tighter. The large view (when a visitor clicks the photo)
          shows exactly this frame; cards on the page keep their own shape
          around the same point.
        </p>
      )}
      {!whole && (
        <div
          role="radiogroup"
          aria-label="Shape of the photo in the large view"
          className="flex flex-wrap gap-2"
        >
          {SHAPES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              role="radio"
              aria-checked={i === shape}
              onClick={() => set(f, zoom, s.a)}
              className={`pill border px-4 text-[13px] ${i === shape ? "border-prussian bg-prussian text-lemon" : "border-editor-border bg-white"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative inline-block self-start overflow-hidden rounded-lg">
          <img
            ref={imgRef}
            src={url}
            alt="Drag the frame to crop the photo"
            draggable={false}
            onLoad={(e) => {
              const im = e.currentTarget;
              if (im.naturalWidth && im.naturalHeight)
                setRatio(im.naturalWidth / im.naturalHeight);
            }}
            className="block max-h-[360px] w-auto max-w-full cursor-move touch-none select-none"
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              fromPointer(e);
            }}
            onPointerMove={(e) => e.buttons === 1 && fromPointer(e)}
          />
          {whole ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_#000231,0_4px_12px_rgba(0,0,0,0.5)]"
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            />
          ) : (
            rect && (
              <span
                aria-hidden="true"
                data-testid="crop-frame"
                className="pointer-events-none absolute rounded-[3px] border-2 border-white shadow-[0_0_0_9999px_rgba(0,2,49,0.55)]"
                style={{
                  left: `${rect.x}%`,
                  top: `${rect.y}%`,
                  width: `${rect.w}%`,
                  height: `${rect.h}%`,
                }}
              />
            )
          )}
        </div>
        <div className="flex min-w-[220px] flex-1 flex-col gap-3">
          <label htmlFor={`${uid}-z`} className="text-sm font-semibold">
            Zoom (crop){" "}
            <span className="font-mono font-normal text-[#55535c]">
              {zoom}%
            </span>
          </label>
          <input
            id={`${uid}-z`}
            type="range"
            min={ZOOM_LIMITS.min}
            max={ZOOM_LIMITS.max}
            step={5}
            value={zoom}
            onChange={(e) => set(f, Number(e.target.value))}
            className="accent-prussian"
          />
          <label htmlFor={`${uid}-x`} className="text-sm font-semibold">
            Left ↔ right{" "}
            <span className="font-mono font-normal text-[#55535c]">{f.x}%</span>
          </label>
          <input
            id={`${uid}-x`}
            type="range"
            min={0}
            max={100}
            value={f.x}
            onChange={(e) => set({ ...f, x: Number(e.target.value) })}
            className="accent-prussian"
          />
          <label htmlFor={`${uid}-y`} className="text-sm font-semibold">
            Top ↕ bottom{" "}
            <span className="font-mono font-normal text-[#55535c]">{f.y}%</span>
          </label>
          <input
            id={`${uid}-y`}
            type="range"
            min={0}
            max={100}
            value={f.y}
            onChange={(e) => set({ ...f, y: Number(e.target.value) })}
            className="accent-prussian"
          />
          <button
            type="button"
            onClick={() => onChange(withCrop(value, null, 100, null))}
            className="pill self-start border border-editor-border bg-white px-4 text-sm"
          >
            {whole ? "Reset" : "Reset (whole photo, centred)"}
          </button>
        </div>
      </div>
      <div>
        <span className="text-sm font-semibold">How it is cropped</span>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          {whole ? (
            <figure className="m-0 flex flex-col gap-1">
              <span className="block h-24 w-24 overflow-hidden rounded-md bg-prussian">
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-contain"
                  style={cropStyle(value)}
                />
              </span>
              <figcaption className="text-[11px] text-[#55535c]">
                In its box
              </figcaption>
            </figure>
          ) : (
            SHAPES.map((s, i) => (
              <figure key={s.label} className="m-0 flex flex-col gap-1">
                <span
                  className={`block h-20 overflow-hidden rounded-md ${i === shape ? "ring-2 ring-prussian ring-offset-2" : ""}`}
                  style={{ aspectRatio: frameRatio(s.a) }}
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    style={cropStyle(value)}
                  />
                </span>
                <figcaption className="text-[11px] text-[#55535c]">
                  {s.label}
                  {i === shape ? " · large view" : ""}
                </figcaption>
              </figure>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
