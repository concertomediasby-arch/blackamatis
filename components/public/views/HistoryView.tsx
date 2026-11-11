"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { EditPencil } from "@/components/public/EditMode";

export function HistoryView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  return (
    <>
      <section className="px-8 sm:px-[72px] lg:px-[88px] relative grid grid-cols-1 items-end gap-12 pb-24 pt-24 md:grid-cols-2">
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
        <p className="m-0 max-w-[620px] text-lg leading-[1.7] text-muted md:justify-self-end">
          {c.vehicle.story}
        </p>
      </section>
    </>
  );
}
