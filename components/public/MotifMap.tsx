"use client";

import { useEffect, useRef, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import type { Motif } from "@/lib/types";
import { useSwipe } from "@/lib/use-swipe";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Photos of the car with numbered points (one or more photos, e.g. both
 * sides); a point (or its row in the list) opens the motif's meaning and shows
 * the photo it sits on. Dots and arrows switch photos. Numbers run across all
 * photos. The list doubles as the text version for screen readers and phones.
 */
export function MotifMap({
  photos,
  motifs,
}: {
  photos: string[];
  motifs: Motif[];
}) {
  const [open, setOpen] = useState<string | null>(motifs[0]?.id ?? null);
  const active = motifs.find((m) => m.id === open) ?? null;
  const count = Math.max(1, photos.length);
  // A motif on a photo that was removed shows on the first photo.
  const photoOf = (m: Motif) => ((m.photo ?? 0) < count ? (m.photo ?? 0) : 0);
  const [shown, setShown] = useState(active ? photoOf(active) : 0);
  const pick = (m: Motif) => {
    setOpen(m.id);
    setShown(photoOf(m));
  };
  // Swipe the photo (or drag with the mouse) to the next / previous one.
  const swipe = useSwipe(
    () => setShown((x) => Math.min(count - 1, x + 1)),
    () => setShown((x) => Math.max(0, x - 1)),
    count > 1,
  );
  const detailRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    detailRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
      <div className="flex flex-col gap-3">
      <div className={`relative ${count > 1 ? "cursor-grab select-none active:cursor-grabbing" : ""}`} {...swipe}>
        <Placeholder
          key={shown}
          path={photos[shown] ?? null}
          label="Car photo with motifs"
          alt={`Black Amethyst with its motifs${count > 1 ? `, photo ${shown + 1} of ${count}` : ""}`}
          className="aspect-[16/10] w-full rounded-[28px] border border-white/10"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {count > 1 &&
          (["prev", "next"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d === "prev" ? "Previous photo" : "Next photo"}
              disabled={d === "prev" ? shown === 0 : shown === count - 1}
              onClick={() => setShown((x) => x + (d === "prev" ? -1 : 1))}
              className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/45 text-ink backdrop-blur-md hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0 ${d === "prev" ? "left-3" : "right-3"}`}
            >
              <span aria-hidden="true">{d === "prev" ? "←" : "→"}</span>
            </button>
          ))}
        {motifs.map((m, i) => {
          if (photoOf(m) !== shown) return null;
          const on = m.id === open;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={on}
              aria-label={`Motif ${i + 1}: ${m.title || "untitled"}`}
              onClick={() => pick(m)}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-[12px] font-semibold shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition-transform ${
                  on
                    ? "scale-110 border-prussian bg-amber text-prussian"
                    : "border-amber bg-[rgba(1,20,53,0.85)] text-amber"
                }`}
              >
                {i + 1}
              </span>
              {on && (
                <span
                  aria-hidden="true"
                  className="absolute h-11 w-11 rounded-full border border-amber/60 motion-safe:animate-ping"
                />
              )}
            </button>
          );
        })}
      </div>
      {count > 1 && (
        <div role="group" aria-label="Choose a photo" className="flex justify-center">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === shown ? "true" : undefined}
              onClick={() => setShown(i)}
              className="flex h-11 w-7 cursor-pointer items-center justify-center"
            >
              <span className={`block h-2 w-2 rounded-full transition-colors ${i === shown ? "bg-amber" : "bg-white/35"}`} />
            </button>
          ))}
        </div>
      )}
      </div>

      <div className="flex flex-col gap-4">
        {active && (
          <div
            ref={detailRef}
            tabIndex={-1}
            aria-live="polite"
            className="glass-dark flex flex-col gap-3 rounded-[28px] p-6 outline-none sm:p-8"
          >
            <span className="font-mono text-[11px] tracking-[0.14em] text-amber">
              MOTIF {pad(motifs.indexOf(active) + 1)}
            </span>
            <h3 className="display m-0 text-[34px] font-extrabold leading-none">
              {active.title || "[Motif name]"}
            </h3>
            <p className="m-0 whitespace-pre-line text-[16px] leading-[1.7] text-muted">
              {active.meaning ||
                "[What it is, what it means, and why it is on the car.]"}
            </p>
          </div>
        )}
        {motifs.length > 0 ? (
          <ol className="m-0 flex list-none flex-col p-0">
            {motifs.map((m, i) => (
              <li key={m.id}>
                <button
                  type="button"
                  aria-pressed={m.id === open}
                  onClick={() => pick(m)}
                  className={`flex min-h-12 w-full cursor-pointer items-center gap-4 border-b border-white/10 py-2 text-left ${m.id === open ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  <span
                    className={`font-mono text-[12px] ${m.id === open ? "text-amber" : "text-muted-2"}`}
                  >
                    {pad(i + 1)}
                  </span>
                  <span className="flex-1 text-[15px] font-semibold">
                    {m.title || "[Motif name]"}
                  </span>
                  <span aria-hidden="true" className="text-amber">
                    {m.id === open ? "●" : "→"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="m-0 font-mono text-[12px] tracking-[0.08em] text-muted-2">
            [NO MOTIFS MARKED YET]
          </p>
        )}
      </div>
    </div>
  );
}
