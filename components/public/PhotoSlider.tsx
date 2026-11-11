"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import type { BonusMedia } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Swipeable photo slider: native horizontal scroll with snap (touch swipe,
 * trackpad, shift+wheel), previous/next buttons, dots and arrow keys.
 * Shows one placeholder slide until photos are uploaded.
 */
export function PhotoSlider({
  photos,
  label,
}: {
  photos: BonusMedia[];
  label: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const slides = photos.length
    ? photos
    : [{ id: "empty", kind: "photo" as const, path: null, caption: "" }];
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

  // Simple mouse drag for desktops without a trackpad.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="flex flex-col gap-4"
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
          tabIndex={0}
          aria-label={`${label}, ${n} photo${n === 1 ? "" : "s"}. Use the arrow keys to move.`}
          className="m-0 flex list-none snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[36px] border border-white/10 p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ cursor: n > 1 ? "grab" : undefined }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse" || n < 2) return;
            drag.current = {
              x: e.clientX,
              left: trackRef.current!.scrollLeft,
              moved: false,
            };
            trackRef.current!.style.scrollSnapType = "none";
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            if (Math.abs(dx) > 4) d.moved = true;
            trackRef.current!.scrollLeft = d.left - dx;
          }}
          onPointerUp={() => {
            const d = drag.current;
            if (!d) return;
            drag.current = null;
            const el = trackRef.current!;
            el.style.scrollSnapType = "";
            go(Math.round(el.scrollLeft / el.clientWidth));
          }}
          onPointerLeave={() =>
            drag.current &&
            trackRef.current?.dispatchEvent(new PointerEvent("pointerup"))
          }
        >
          {slides.map((s, i) => (
            <li
              key={s.id}
              className="w-full flex-none snap-center snap-always"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
            >
              <Placeholder
                path={s.path}
                label="Car photo"
                alt={s.caption || `Black Amatis, photo ${i + 1}`}
                className="pointer-events-none aspect-[4/3] w-full select-none sm:aspect-[16/9] xl:aspect-[21/9]"
                sizes="100vw"
              />
            </li>
          ))}
        </ul>

        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              disabled={index === 0}
              onClick={() => go(index - 1)}
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/45 text-ink backdrop-blur-md transition-opacity hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0 sm:left-6"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              aria-label="Next photo"
              disabled={index === n - 1}
              onClick={() => go(index + 1)}
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/45 text-ink backdrop-blur-md transition-opacity hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0 sm:right-6"
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 sm:px-12">
        <p
          aria-live="polite"
          className="m-0 min-h-5 font-mono text-[12px] uppercase tracking-[0.14em] text-muted-2"
        >
          {slides[index]?.caption}
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
    </div>
  );
}
