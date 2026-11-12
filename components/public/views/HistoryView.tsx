"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { MediaGallery } from "@/components/public/MediaGallery";
import { PhotoSlider } from "@/components/public/PhotoSlider";
import { normalizeMedia } from "@/lib/bonus-media";
import { EditPencil } from "@/components/public/EditMode";

export function HistoryView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  return (
    <>
      {/* Headline and story as one block, aligned with the edges of the slider below; the story sits right beside the headline. */}
      <section className="relative grid grid-cols-1 items-end gap-8 px-5 pb-16 pt-24 sm:px-8 md:grid-cols-[auto_minmax(0,640px)] md:justify-start md:gap-14 lg:gap-20 lg:px-12">
        <EditPencil
          href="/editor/vehicle/#f-story"
          label="History summary"
          className="right-5 top-20 sm:right-10"
        />
        <div className="flex flex-col gap-4">
          <span className="eyebrow text-amber">01 — History</span>
          <h1
            className="display m-0 font-black"
            style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}
          >
            From stock
            <br />
            to the stage.
          </h1>
        </div>
        <div className="flex max-w-[640px] flex-col gap-4 text-lg leading-[1.7] text-muted">
          {/* Each line or blank-line-separated block of the story is its own paragraph. */}
          {(c.vehicle.story ?? "")
            .split(/\n+/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => (
              <p key={i} className="m-0">
                {p}
              </p>
            ))}
        </div>
      </section>
      <section
        aria-label="The car"
        className="relative px-3 pb-24 sm:px-6 lg:px-10"
      >
        <EditPencil
          href="/editor/vehicle/#f-history-photo"
          label="History photos"
          className="-top-5 right-8"
        />
        <PhotoSlider
          photos={normalizeMedia(c.vehicle.history_photos)}
          label="Photos and videos of Black Amatis"
        />
      </section>
      <section
        aria-label="Gallery"
        className="relative px-3 pb-24 sm:px-6 lg:px-10"
      >
        <EditPencil
          href="/editor/vehicle/#f-history-gallery"
          label="History gallery"
          className="-top-5 right-8"
        />
        <MediaGallery
          items={normalizeMedia(c.vehicle.history_gallery)}
          label="Gallery of Black Amatis"
        />
      </section>
    </>
  );
}
