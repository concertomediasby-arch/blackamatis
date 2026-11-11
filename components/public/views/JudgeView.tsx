"use client";

import { ContentFallback, useSiteContent } from "@/components/public/ContentProvider";
import { JudgeBoard } from "@/components/public/JudgeBoard";
import type { CriterionKey } from "@/lib/emma/matrix";


export function JudgeView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  const ready = Object.fromEntries(c.evidence.map((e) => [e.criterion_key, e.ready])) as Partial<Record<CriterionKey, boolean>>;
  return (
    <>
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 items-end gap-12 px-5 pb-16 pt-24 sm:px-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="eyebrow text-amber">05 — Judge Mode</span>
          <h1 className="display m-0 font-black" style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}>
            Every criterion.
            <br />
            Every proof.
          </h1>
        </div>
        <p className="m-0 text-lg leading-[1.7] text-muted">
          A quick reference for the judges. Each criterion from the EMMA Install Judge Book 2026 is linked to the evidence for Black Amatis, so it can be
          checked without removing a single panel.
        </p>
      </section>
      <JudgeBoard initialClass={c.vehicle.class} ready={ready} content={c} />
    </>
  );
}
