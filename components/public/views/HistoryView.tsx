"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { Placeholder } from "@/components/ui/Placeholder";
import { EditPencil } from "@/components/public/EditMode";

export function HistoryView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  const ms = [...c.milestones].sort((a, b) => a.sort - b.sort);
  return (
    <>
      <section className="px-8 sm:px-[72px] lg:px-[88px] relative grid grid-cols-1 items-end gap-12 pb-16 pt-24 md:grid-cols-2">
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

      <section
        aria-labelledby="timeline"
        className="px-8 sm:px-[72px] lg:px-[88px] relative pb-24"
      >
        <EditPencil
          href="/editor/vehicle/#timeline"
          label="Build timeline"
          className="right-5 top-0 sm:right-10"
        />
        <h2 id="timeline" className="display m-0 mb-12 text-5xl font-extrabold">
          Build timeline
        </h2>
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {ms.map((m) => (
            <li
              key={m.id}
              className="glass-dark grid grid-cols-1 items-start gap-4 rounded-3xl p-6 sm:grid-cols-[minmax(120px,200px)_1fr_minmax(0,220px)] sm:gap-8 sm:p-8"
            >
              <span className="font-display text-[32px] font-bold leading-none text-amber">
                {m.when_label}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="m-0 font-display text-[28px] font-bold leading-tight">
                  {m.title}
                </h3>
                <p className="m-0 leading-relaxed text-muted-2">{m.body}</p>
              </div>
              <Placeholder
                path={m.photo_path}
                label="Photo"
                alt={m.title}
                className="h-[120px] rounded-[20px] bg-[rgba(1,20,53,0.5)]"
                sizes="220px"
              />
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
