"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSwipe } from "@/lib/use-swipe";
import { Placeholder } from "@/components/ui/Placeholder";
import type { BonusMedia } from "@/lib/types";
import { PlayIcon, VideoPlayer, VideoStill } from "./MediaPlayer";


/**
 * Square tiles of photos and videos filling the row from edge to edge (2 per
 * row on phones, up to 6 on wide screens). A tile opens the item large, with
 * previous / next, Esc to close and the caption underneath.
 */
export function MediaGallery({
  items,
  label,
}: {
  items: BonusMedia[];
  label: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const n = items.length;

  const close = useCallback(() => {
    setOpen((i) => {
      if (i != null) tiles.current[i]?.focus();
      return null;
    });
  }, []);
  const go = useCallback(
    (d: -1 | 1) => setOpen((i) => (i == null ? i : (i + d + n) % n)),
    [n],
  );
  // Swipe the open photo (or drag with the mouse) to the next / previous one.
  const swipe = useSwipe(() => go(1), () => go(-1), n > 1);

  useEffect(() => {
    if (open == null) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, close, go]);

  if (n === 0)
    return (
      <ul
        aria-label={label}
        className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <Placeholder
              path={null}
              label="Photo or video"
              className="aspect-square w-full rounded-2xl text-[10px]"
            />
          </li>
        ))}
      </ul>
    );

  const cur = open != null ? items[open] : null;
  const title = (m: BonusMedia, i: number) =>
    m.caption || `Black Amethyst, ${m.kind} ${i + 1}`;

  return (
    <>
      <ul
        aria-label={label}
        className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6"
      >
        {items.map((m, i) => (
          <li key={m.id}>
            <button
              ref={(el) => {
                tiles.current[i] = el;
              }}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${m.kind === "video" ? "Play video" : "Open photo"} ${i + 1} of ${n}${m.caption ? `: ${m.caption}` : ""}`}
              className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              {m.kind === "photo" ? (
                <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
                  <Placeholder
                    path={m.path}
                    label="Photo"
                    alt=""
                    className="h-full w-full"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  />
                </span>
              ) : (
                <>
                  <VideoStill m={m} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-prussian shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-110">
                      <PlayIcon size={22} />
                    </span>
                  </span>
                </>
              )}
            </button>
            {/* The caption sits under the tile, not over the photo (it is already in the tile's label). */}
            {m.caption && (
              <p aria-hidden="true" className="m-0 mt-2 px-1 text-[13px] leading-snug text-muted">
                {m.caption}
              </p>
            )}
          </li>
        ))}
      </ul>

      {cur &&
        open != null &&
        createPortal(
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title(cur, open)}
            tabIndex={-1}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-[rgba(0,2,49,0.94)] p-3 outline-none sm:p-8"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div className="flex w-full max-w-[1200px] items-center justify-end gap-3 text-ink">
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full max-w-[1200px] select-none" {...swipe}>
              {cur.kind === "photo" ? (
                <Placeholder
                  path={cur.path?.split("#")[0] ?? null}
                  label="Photo"
                  alt={title(cur, open)}
                  fit="contain"
                  className="h-[72vh] w-full"
                  sizes="100vw"
                />
              ) : (
                <div className="relative mx-auto aspect-video max-h-[72vh] w-full bg-black">
                  <VideoPlayer
                    key={cur.id}
                    m={cur}
                    title={title(cur, open)}
                    autoPlay
                  />
                </div>
              )}
              {n > 1 &&
                ([-1, 1] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => go(d)}
                    aria-label={d < 0 ? "Previous" : "Next"}
                    className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/50 text-ink backdrop-blur-md hover:bg-black/70 ${d < 0 ? "left-2" : "right-2"}`}
                  >
                    <span aria-hidden="true">{d < 0 ? "←" : "→"}</span>
                  </button>
                ))}
            </div>
            {n > 1 && (
              <div role="group" aria-label="Choose a photo" className="flex max-w-[1200px] flex-wrap justify-center">
                {items.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === open ? "true" : undefined}
                    onClick={() => setOpen(i)}
                    className="flex h-11 w-6 cursor-pointer items-center justify-center"
                  >
                    <span className={`block h-1.5 w-1.5 rounded-full transition-colors ${i === open ? "bg-amber" : "bg-white/35"}`} />
                  </button>
                ))}
              </div>
            )}
            {cur.caption && (
              <p className="m-0 max-w-[900px] text-center text-[15px] leading-relaxed text-muted">
                {cur.caption}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
