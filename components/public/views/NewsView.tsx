"use client";

import { ContentFallback, useSiteContent } from "@/components/public/ContentProvider";
import { EditPencil } from "@/components/public/EditMode";
import { NewsList } from "@/components/public/NewsList";

/** News page: the team's posts about the car, newest first. */
export function NewsView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  return (
    <>
      <section className="relative flex flex-col gap-4 px-5 pb-12 pt-24 md:px-[88px]">
        <EditPencil href="/editor/news/" label="News" className="right-5 top-20 sm:right-10" />
        <span className="eyebrow text-amber">06 — News</span>
        <h1 className="display m-0 font-black" style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}>
          What&apos;s new
          <br />
          on the build.
        </h1>
        <p className="m-0 max-w-[640px] text-lg leading-[1.7] text-muted">
          Updates from the team as Black Amethyst gets ready for EMMA. To hear about new posts, open Settings (the gear at
          the top) and turn on news notifications.
        </p>
      </section>
      <section aria-label="News posts" className="px-3 pb-24 sm:px-6 lg:px-10">
        <NewsList posts={state.content.news} />
      </section>
    </>
  );
}
