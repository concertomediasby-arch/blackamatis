"use client";

import { useCallback, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { heroTransform, normalizeLayout } from "@/lib/photo";
import { VideoPlayer } from "./MediaPlayer";
import { useSwipe, useWheelSwipe } from "@/lib/use-swipe";
import type { BonusMedia } from "@/lib/types";
import { ZoomablePhoto } from "./Lightbox";

type Slide = { id: string; caption?: string };

/**
 * Carousel whose slides crossfade in place: swipe (touch, pen, mouse drag,
 * two-finger touchpad), previous/next buttons, dots (no counter) and arrow
 * keys. `framed` puts the slides in a rounded border (photos); `bare` leaves
 * them open (cut-out car over the hero).
 */
export function Carousel<T extends Slide>({
  slides,
  label,
  renderSlide,
  variant = "framed",
  showCaption = true,
  footerClassName = "px-5 sm:px-12",
  bordered = true,
  rounded = true,
}: {
  slides: T[];
  label: string;
  renderSlide: (s: T, i: number) => React.ReactNode;
  variant?: "framed" | "bare";
  showCaption?: boolean;
  footerClassName?: string;
  /** Thin line around a framed track. */
  bordered?: boolean;
  /** Round the framed track's corners (off inside a card). */
  rounded?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const n = slides.length;

  const go = useCallback(
    (i: number) => setIndex(Math.max(0, Math.min(n - 1, i))),
    [n],
  );

  // Swipe (touch, pen, mouse drag) and two-finger touchpad swipe; a swipe never
  // also counts as a click on the photo (which opens it large).
  const swipe = useSwipe(() => go(index + 1), () => go(index - 1), n > 1);
  const wheel = useWheelSwipe(() => go(index + 1), () => go(index - 1), n > 1);

  const arrow =
    variant === "framed"
      ? "border-white/10 bg-black/15 opacity-50 hover:bg-black/45 hover:opacity-100 focus-visible:opacity-100"
      : "border-white/20 bg-[rgba(1,20,53,0.55)] hover:bg-[rgba(1,20,53,0.8)]";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="flex w-full flex-col gap-4"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
        }
      }}
    >
      <div className="relative">
        {/* Slides sit on top of each other and crossfade: the photo in view fades
            out while the next one fades in, in the same place (no sideways move). */}
        <ul
          ref={wheel}
          tabIndex={n > 1 ? 0 : -1}
          aria-label={`${label}, ${n} photo${n === 1 ? "" : "s"}${n > 1 ? ". Use the arrow keys or swipe to move." : ""}`}
          {...swipe}
          className={`m-0 grid list-none p-0 ${n > 1 ? "cursor-grab select-none active:cursor-grabbing" : ""} ${
            variant === "framed"
              ? `overflow-hidden ${rounded ? "rounded-[36px]" : ""} ${bordered ? "border border-white/10" : ""}`
              : ""
          }`}
        >
          {slides.map((s, i) => {
            const on = i === index;
            return (
              <li
                key={s.id}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                aria-hidden={!on}
                inert={!on}
                className="slide-fade [grid-area:1/1]"
                style={{
                  opacity: on ? 1 : 0,
                  zIndex: on ? 1 : 0,
                  pointerEvents: on ? undefined : "none",
                }}
              >
                {renderSlide(s, i)}
              </li>
            );
          })}
        </ul>

        {n > 1 &&
          (["prev", "next"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d === "prev" ? "Previous photo" : "Next photo"}
              disabled={d === "prev" ? index === 0 : index === n - 1}
              onClick={() => go(index + (d === "prev" ? -1 : 1))}
              className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 sm:h-12 sm:w-12 cursor-pointer items-center justify-center rounded-full border text-ink backdrop-blur-md transition-opacity disabled:pointer-events-none disabled:opacity-0 ${arrow} ${
                variant === "bare"
                  ? // Phones: under the car, beside the dots, so the arrows never cover it.
                    d === "prev"
                    ? "max-sm:top-auto max-sm:-bottom-[60px] max-sm:translate-y-0 left-0"
                    : "max-sm:top-auto max-sm:-bottom-[60px] max-sm:translate-y-0 max-sm:left-[52px] sm:right-0"
                  : d === "prev"
                    ? "left-2 sm:left-6"
                    : "right-2 sm:right-6"
              }`}
            >
              <span aria-hidden="true">{d === "prev" ? "←" : "→"}</span>
            </button>
          ))}
      </div>

      {(n > 1 || (showCaption && slides[index]?.caption)) && (
        <div
          className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 ${footerClassName}`}
        >
          <p
            aria-live="polite"
            className="m-0 min-h-5 font-mono text-[12px] uppercase tracking-[0.14em] text-muted-2"
          >
            {showCaption ? slides[index]?.caption : null}
          </p>
          {n > 1 && (
            <div className="flex items-center gap-4">
              <div role="group" aria-label="Choose a photo" className="flex">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => go(i)}
                    className="flex h-11 w-6 cursor-pointer items-center justify-center"
                  >
                    <span
                      className={`block h-1.5 w-1.5 rounded-full transition-colors ${i === index ? "bg-amber" : "bg-white/35"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Frame of a History slide (4:3 on phones, 16:9 from tablets); its maximum height is set per page (default 78% of the screen). */
export const SLIDE_FRAME =
  "relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9]";
const frameHeight = (vh = 78) => ({ maxHeight: `${vh}vh` });

/**
 * One History photo, shown whole (contain) so a cut-out car is never cropped,
 * then moved and scaled by its saved position & size.
 */
export function FramedPhoto({
  photo,
  alt,
  className = "",
  maxVh,
}: {
  photo: Pick<BonusMedia, "path" | "layout">;
  alt: string;
  className?: string;
  /** Maximum height, % of the screen height. */
  maxVh?: number;
}) {
  return (
    <div className={`${SLIDE_FRAME} ${className}`} style={frameHeight(maxVh)}>
      <div
        className="absolute inset-0"
        style={{ transform: heroTransform(normalizeLayout(photo.layout)) }}
      >
        <Placeholder
          path={photo.path}
          label="Car photo"
          alt={alt}
          fit="contain"
          className="h-full w-full"
          sizes="100vw"
        />
      </div>
    </div>
  );
}

/** One slide: a photo (whole, with its position & size) or a video, in the slide frame. */
export function FramedMedia({
  m,
  alt,
  maxVh,
}: {
  m: BonusMedia;
  alt: string;
  maxVh?: number;
}) {
  if (m.kind === "photo")
    return (
      <FramedPhoto
        photo={m}
        alt={alt}
        maxVh={maxVh}
        className="pointer-events-none select-none"
      />
    );
  return (
    <div className={`${SLIDE_FRAME} bg-black`} style={frameHeight(maxVh)}>
      <VideoPlayer m={m} title={alt} />
    </div>
  );
}

/** Photo / video slider for the History page; one placeholder slide until something is uploaded. */
export function PhotoSlider({
  photos,
  label,
  maxVh,
  bordered = true,
}: {
  photos: BonusMedia[];
  label: string;
  /** Maximum slide height, % of the screen height. */
  maxVh?: number;
  /** Thin line around the slider. */
  bordered?: boolean;
}) {
  const slides = photos.length
    ? photos
    : [{ id: "empty", kind: "photo" as const, path: null, caption: "" }];
  return (
    <Carousel
      slides={slides}
      label={label}
      bordered={bordered}
      renderSlide={(s, i) =>
        s.kind === "photo" ? (
          <ZoomablePhoto group={slides} index={i} label={s.caption || `photo ${i + 1}`}>
            <FramedMedia m={s} maxVh={maxVh} alt={s.caption || `Black Amethyst, ${s.kind} ${i + 1}`} />
          </ZoomablePhoto>
        ) : (
          <FramedMedia m={s} maxVh={maxVh} alt={s.caption || `Black Amethyst, ${s.kind} ${i + 1}`} />
        )
      }
    />
  );
}
