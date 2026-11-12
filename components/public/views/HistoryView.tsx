"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { PageHeader } from "@/components/public/PageHeader";
import { pageLayoutOf } from "@/lib/page-layout";
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
      <PageHeader
        page="history"
        text={c.vehicle.story}
        layout={pageLayoutOf(c.vehicle, "history")}
      >
        <EditPencil
          href="/editor/vehicle/#f-story"
          label="History summary"
          className="right-5 top-20 sm:right-10"
        />
      </PageHeader>
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
