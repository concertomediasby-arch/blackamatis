"use client";

import { Placeholder } from "@/components/ui/Placeholder";
import { VideoPlayer } from "@/components/public/MediaPlayer";
import { Carousel } from "@/components/public/PhotoSlider";
import { normalizeMedia } from "@/lib/bonus-media";
import type { BonusMedia, SiteContent, ThemeZone } from "@/lib/types";

/** The zone's media list as the editor edits it: its photos and videos (empty slots included), or the older single photo. */
export function zoneEditMedia(z: ThemeZone): BonusMedia[] {
  if (Array.isArray(z.media) && z.media.length) return normalizeMedia(z.media);
  return z.photo_path ? [{ id: "cover", kind: "photo", path: z.photo_path, url: null, caption: "" }] : [];
}

/** A zone's slides on the site: its uploaded photos and videos, or one placeholder. */
export function zoneMedia(z: ThemeZone): BonusMedia[] {
  const media = zoneEditMedia(z).filter((m) => m.path || m.url);
  if (media.length) return media;
  return [{ id: "cover", kind: "photo", path: null, url: null, caption: "" }];
}

/** The photos and videos of one zone as a slider at the top of its card. */
function ZoneSlides({ z }: { z: ThemeZone }) {
  return (
    <Carousel
      slides={zoneMedia(z)}
      label={`${z.name} photos and videos`}
      bordered={false}
      rounded={false}
      footerClassName="px-7 pt-1"
      renderSlide={(m, i) => {
        const alt = m.caption || `${z.name}, ${m.kind} ${i + 1}`;
        return m.kind === "video" ? (
          <div className="relative h-[260px] w-full bg-black">
            <VideoPlayer m={m} title={alt} muted />
          </div>
        ) : (
          <Placeholder
            path={m.path}
            label={`${z.name} photo`}
            alt={alt}
            className="pointer-events-none h-[260px] w-full select-none border-0"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        );
      }}
    />
  );
}

/**
 * Theme: one card per zone (Exterior, Interior, Trunk and any zone the team
 * adds), with its photos and videos as a slider, a zone number and the theme
 * elements (also the editor's preview).
 */
export function ZoneCards({ zones }: { zones: SiteContent["zones"] }) {
  return (
    <ul className="px-8 sm:px-[72px] lg:px-[88px] m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 pb-24">
      {zones.map((z, i) => (
        <li
          key={z.id}
          className="glass-dark flex flex-col overflow-hidden rounded-[28px]"
        >
          <div className="border-b border-white/10">
            <ZoneSlides z={z} />
          </div>
          <div className="flex flex-col gap-3.5 p-7">
            {/* A zone number, not the judge criterion (team decision: no judging labels for visitors). */}
            <span className="label text-amber">
              Zone {String(i + 1).padStart(2, "0")} / {String(zones.length).padStart(2, "0")}
            </span>
            <h3 className="display m-0 text-[34px] font-extrabold">{z.name}</h3>
            {z.elements.length > 0 && (
              <ul className="m-0 flex flex-col gap-2 pl-5 text-[15px] leading-normal text-muted">
                {z.elements.map((e, j) => (
                  <li key={j}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
