"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Placeholder } from "@/components/ui/Placeholder";
import { photoAspect, photoZoom } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";
import { useSwipe, useWheelSwipe } from "@/lib/use-swipe";
import type { BonusMedia } from "@/lib/types";
import { VideoPlayer } from "./MediaPlayer";

const title = (m: BonusMedia, i: number) => m.caption || `Black Amethyst, ${m.kind} ${i + 1}`;

/** Height of the photo area in the window. */
const AREA = "min(68vh, 760px)";

/**
 * A photo in the large view: cut to the shape and zoom chosen in Crop &
 * position, or whole when it has neither. It sits centred in a photo area of
 * fixed height, so the window keeps its size while the visitor slides.
 */
function LightboxPhoto({ path, alt }: { path: string | null; alt: string }) {
  const aspect = photoAspect(path);
  const zoom = photoZoom(path);
  const url = storageUrl(path);
  // Only a zoomed photo in its own shape needs its size measured first.
  const needSize = !aspect && zoom > 100;
  const [natural, setNatural] = useState<number | null>(null);
  useEffect(() => {
    if (!needSize || !url) return;
    const im = new window.Image();
    im.onload = () => im.naturalHeight && setNatural(im.naturalWidth / im.naturalHeight);
    im.src = url;
  }, [needSize, url]);
  if (!url) return null;
  if (!aspect && !needSize)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- sized by the photo itself, so the rounded corners hug it
      <img
        src={url}
        alt={alt}
        draggable={false}
        className="block max-h-full max-w-full rounded-2xl object-contain"
      />
    );
  const ratio = aspect ? aspect.w / aspect.h : natural;
  if (!ratio) return null;
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ aspectRatio: ratio, width: `min(100%, calc(${AREA} * ${ratio}))` }}
    >
      <Placeholder path={path} label="Photo" alt={alt} className="h-full w-full" sizes="100vw" />
    </div>
  );
}

/**
 * A photo or video shown large in a window over the page: swipe or ← → to go
 * through the group, plain dots, the caption underneath, × / Esc / a click on
 * the dark backdrop to close. Focus returns to what opened it.
 */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: BonusMedia[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const n = items.length;
  const dialogRef = useRef<HTMLDivElement>(null);
  // Direction of the last switch, for the parallax slide-in (0 = just opened).
  const [dir, setDir] = useState(0);
  const go = useCallback(
    (d: -1 | 1) => {
      setDir(d);
      onIndex((index + d + n) % n);
    },
    [index, n, onIndex],
  );
  const swipe = useSwipe(() => go(1), () => go(-1), n > 1);
  const wheel = useWheelSwipe(() => go(1), () => go(-1), n > 1);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && n > 1) go(1);
      else if (e.key === "ArrowLeft" && n > 1) go(-1);
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    // No "back a page" from a sideways touchpad swipe while the window is open.
    const root = document.documentElement;
    const { overscrollBehaviorX } = root.style;
    root.style.overscrollBehaviorX = "none";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      root.style.overscrollBehaviorX = overscrollBehaviorX;
    };
  }, [go, n, onClose]);

  const cur = items[index];
  if (!cur) return null;
  return createPortal(
    <div
      ref={(el) => {
        dialogRef.current = el;
        wheel(el);
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title(cur, index)}
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,2,49,0.45)] p-3 outline-none backdrop-blur-[6px] sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-dark relative flex max-h-full w-full max-w-[1120px] flex-col gap-3 overflow-y-auto rounded-[32px] p-3 sm:p-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[rgba(1,20,53,0.6)] text-ink backdrop-blur-md hover:bg-white/10 sm:right-5 sm:top-5"
        >
          ✕
        </button>
        <div
          className="relative flex w-full select-none items-center justify-center"
          {...swipe}
          style={{ ...swipe.style, height: AREA }}
        >
          <div
            key={cur.id + index}
            className={`flex h-full w-full items-center justify-center ${dir > 0 ? "px-in-next" : dir < 0 ? "px-in-prev" : ""}`}
          >
            {cur.kind === "photo" ? (
              <LightboxPhoto path={cur.path} alt={title(cur, index)} />
            ) : (
              <div
                className="relative mx-auto aspect-video overflow-hidden rounded-2xl bg-black"
                style={{ width: `min(100%, calc(${AREA} * 16 / 9))` }}
              >
                <VideoPlayer key={cur.id} m={cur} title={title(cur, index)} autoPlay muted />
              </div>
            )}
          </div>
          {n > 1 &&
            ([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => go(d)}
                aria-label={d < 0 ? "Previous" : "Next"}
                className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/15 text-ink opacity-50 backdrop-blur-sm hover:bg-black/45 hover:opacity-100 focus-visible:opacity-100 ${d < 0 ? "left-1 sm:left-2" : "right-1 sm:right-2"}`}
              >
                <span aria-hidden="true">{d < 0 ? "←" : "→"}</span>
              </button>
            ))}
        </div>
        {n > 1 && (
          <div role="group" aria-label="Choose a photo" className="flex flex-wrap justify-center">
            {items.map((m, i) => (
              <button
                key={m.id + i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => {
                  if (i !== index) setDir(i > index ? 1 : -1);
                  onIndex(i);
                }}
                className="flex h-11 w-6 cursor-pointer items-center justify-center"
              >
                <span className={`block h-1.5 w-1.5 rounded-full transition-colors ${i === index ? "bg-amber" : "bg-white/35"}`} />
              </button>
            ))}
          </div>
        )}
        {cur.caption && (
          <p className="m-0 mx-auto max-w-[900px] px-2 pb-1 text-center text-[15px] leading-relaxed text-muted">{cur.caption}</p>
        )}
      </div>
    </div>,
    document.body,
  );
}

type Open = (items: BonusMedia[], index?: number) => void;
const LightboxCtx = createContext<Open | null>(null);

/** One lightbox for the whole public site; any photo can open it with its group. */
export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ items: BonusMedia[]; index: number } | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback<Open>((items, index = 0) => {
    const list = items.filter((m) => m.path || m.url);
    if (!list.length) return;
    opener.current = document.activeElement as HTMLElement | null;
    const at = Math.max(0, list.indexOf(items[index]));
    setState({ items: list, index: at });
  }, []);
  const close = useCallback(() => {
    setState(null);
    opener.current?.focus();
  }, []);
  return (
    <LightboxCtx.Provider value={open}>
      {children}
      {state && (
        <Lightbox
          items={state.items}
          index={state.index}
          onIndex={(i) => setState((s) => (s ? { ...s, index: i } : s))}
          onClose={close}
        />
      )}
    </LightboxCtx.Provider>
  );
}

/** Open the site lightbox; null outside the public site (e.g. editor previews), where photos stay plain. */
export function useLightbox(): Open | null {
  return useContext(LightboxCtx);
}

/** A photo that opens large when clicked (a plain photo when no lightbox is available). */
export function ZoomablePhoto({
  group,
  index = 0,
  children,
  className = "",
  label,
}: {
  group: BonusMedia[];
  index?: number;
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const open = useLightbox();
  const item = group[index];
  if (!open || !item || !(item.path || item.url)) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      onClick={() => open(group, index)}
      aria-label={`Open larger: ${label || item.caption || "photo"}`}
      className={`group/zoom relative block w-full cursor-zoom-in p-0 text-left ${className}`}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-ink opacity-0 backdrop-blur-sm transition-opacity group-hover/zoom:opacity-100 group-focus-visible/zoom:opacity-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </span>
    </button>
  );
}
