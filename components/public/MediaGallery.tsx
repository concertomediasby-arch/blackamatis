"use client";

import { useCallback, useRef, useState } from "react";
import { Lightbox } from "./Lightbox";
import { Placeholder } from "@/components/ui/Placeholder";
import type { BonusMedia } from "@/lib/types";
import { PlayIcon, VideoStill } from "./MediaPlayer";


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
  const n = items.length;

  const close = useCallback(() => {
    setOpen((i) => {
      if (i != null) tiles.current[i]?.focus();
      return null;
    });
  }, []);


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

      {open != null && (
        <Lightbox items={items} index={open} onIndex={setOpen} onClose={close} />
      )}
    </>
  );
}
