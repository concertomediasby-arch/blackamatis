"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import type { BonusMedia } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");

type Slide = { id: string; caption?: string };

/**
 * Swipeable carousel: native horizontal scroll with snap (touch swipe,
 * trackpad), mouse drag, previous/next buttons, dots, a 01 / 03 counter and
 * arrow keys. `framed` puts the track in a rounded border (photos); `bare`
 * leaves it open (cut-out car over the hero).
 */
export function Carousel<T extends Slide>({
  slides,
  label,
  renderSlide,
  variant = "framed",
  showCaption = true,
  footerClassName = "px-5 sm:px-12",
}: {
  slides: T[];
  label: string;
  renderSlide: (s: T, i: number) => React.ReactNode;
  variant?: "framed" | "bare";
  showCaption?: boolean;
  footerClassName?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const n = slides.length;

  // Follow the slide in view while the visitor swipes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () =>
      setIndex(
        Math.max(
          0,
          Math.min(
            n - 1,
            Math.round(el.scrollLeft / Math.max(1, el.clientWidth)),
          ),
        ),
      );
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [n]);

  const go = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const to = Math.max(0, Math.min(n - 1, i));
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({
        left: to * el.clientWidth,
        behavior: reduce ? "auto" : "smooth",
      });
      setIndex(to);
    },
    [n],
  );

  // Mouse drag for desktops without a trackpad.
  const drag = useRef<{ x: number; left: number } | null>(null);
  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    const el = trackRef.current!;
    el.style.scrollSnapType = "";
    go(Math.round(el.scrollLeft / el.clientWidth));
  };

  const arrow =
    variant === "framed"
      ? "border-white/25 bg-black/45 hover:bg-black/65"
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
        <ul
          ref={trackRef}
          tabIndex={n > 1 ? 0 : -1}
          aria-label={`${label}, ${n} photo${n === 1 ? "" : "s"}${n > 1 ? ". Use the arrow keys to move." : ""}`}
          className={`m-0 flex list-none snap-x snap-mandatory overflow-x-auto overscroll-x-contain p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            variant === "framed" ? "rounded-[36px] border border-white/10" : ""
          }`}
          style={{ cursor: n > 1 ? "grab" : undefined }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse" || n < 2) return;
            drag.current = { x: e.clientX, left: trackRef.current!.scrollLeft };
            trackRef.current!.style.scrollSnapType = "none";
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (d) trackRef.current!.scrollLeft = d.left - (e.clientX - d.x);
          }}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {slides.map((s, i) => (
            <li
              key={s.id}
              className="w-full flex-none snap-center snap-always"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
            >
              {renderSlide(s, i)}
            </li>
          ))}
        </ul>

        {n > 1 &&
          (["prev", "next"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d === "prev" ? "Previous photo" : "Next photo"}
              disabled={d === "prev" ? index === 0 : index === n - 1}
              onClick={() => go(index + (d === "prev" ? -1 : 1))}
              className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border text-ink backdrop-blur-md transition-opacity disabled:pointer-events-none disabled:opacity-0 ${arrow} ${
                d === "prev" ? "left-2 sm:left-6" : "right-2 sm:right-6"
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
              <span className="font-mono text-[12px] tracking-[0.14em] text-muted-2">
                <span className="text-amber">{pad(index + 1)}</span> / {pad(n)}
              </span>
              <div role="group" aria-label="Choose a photo" className="flex">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => go(i)}
                    className="flex h-11 w-7 cursor-pointer items-center justify-center"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-amber" : "w-1.5 bg-white/35"}`}
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

/** Photo slider for the History page; one placeholder slide until photos are uploaded. */
export function PhotoSlider({
  photos,
  label,
}: {
  photos: BonusMedia[];
  label: string;
}) {
  const slides = photos.length
    ? photos
    : [{ id: "empty", kind: "photo" as const, path: null, caption: "" }];
  return (
    <Carousel
      slides={slides}
      label={label}
      renderSlide={(s, i) => (
        <Placeholder
          path={s.path}
          label="Car photo"
          alt={s.caption || `Black Amatis, photo ${i + 1}`}
          className="pointer-events-none aspect-[4/3] w-full select-none sm:aspect-[16/9] xl:aspect-[21/9]"
          sizes="100vw"
        />
      )}
    />
  );
}
