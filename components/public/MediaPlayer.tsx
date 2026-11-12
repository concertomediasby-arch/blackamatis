"use client";

/* eslint-disable @next/next/no-img-element -- remote YouTube thumbnail in a static export */

import { youtubeId } from "@/lib/bonus-media";
import { storageUrl } from "@/lib/supabase/env";
import type { BonusMedia } from "@/lib/types";

/**
 * A video item filling its (relative, sized) parent: a YouTube link plays
 * inline (privacy-enhanced embed), an uploaded file plays with controls, any
 * other link opens in a new tab.
 */
export function VideoPlayer({
  m,
  title,
  autoPlay = false,
  muted = false,
}: {
  m: BonusMedia;
  title: string;
  autoPlay?: boolean;
  /** Start without sound (visitors can turn it on). */
  muted?: boolean;
}) {
  const yt = youtubeId(m.url);
  const file = storageUrl(m.path);
  if (yt)
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${yt}${[autoPlay && "autoplay=1", muted && "mute=1"].filter(Boolean).length ? `?${[autoPlay && "autoplay=1", muted && "mute=1"].filter(Boolean).join("&")}` : ""}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  if (file)
    return (
      <video
        src={file}
        controls
        muted={muted}
        ref={(el) => {
          if (el && muted) el.muted = el.defaultMuted = true;
        }}
        playsInline
        autoPlay={autoPlay}
        preload="metadata"
        aria-label={title}
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
    );
  if (m.url)
    return (
      <a
        href={m.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-lemon hover:bg-black/80"
      >
        <PlayIcon size={40} />
        <span className="text-sm font-semibold">Watch video ↗</span>
      </a>
    );
  return (
    <div
      role="img"
      aria-label={`${title} (video not added yet)`}
      className="placeholder-box absolute inset-0 border-white/30 text-muted-2"
    >
      [Video]
    </div>
  );
}

export function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/** A still for a video tile: YouTube thumbnail, or the first frame of an uploaded file. */
export function VideoStill({ m }: { m: BonusMedia }) {
  const yt = youtubeId(m.url);
  const file = storageUrl(m.path);
  if (yt)
    return (
      <img
        src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  if (file)
    return (
      <video
        src={`${file}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  return <div aria-hidden="true" className="absolute inset-0 bg-black/60" />;
}
