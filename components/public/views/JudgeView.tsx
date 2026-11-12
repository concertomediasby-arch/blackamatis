"use client";

import { PageHeader } from "@/components/public/PageHeader";
import { pageLayoutOf } from "@/lib/page-layout";
import { EditPencil } from "@/components/public/EditMode";
import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { JudgeBoard } from "@/components/public/JudgeBoard";
import type { CriterionKey } from "@/lib/emma/matrix";

export function JudgeView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  const ready = Object.fromEntries(
    c.evidence.map((e) => [e.criterion_key, e.ready]),
  ) as Partial<Record<CriterionKey, boolean>>;
  return (
    <>
      <PageHeader page="judge" layout={pageLayoutOf(c.vehicle, "judge")}>
        <EditPencil
          href="/editor/vehicle/#page-layouts"
          label="Page layout"
          className="right-5 top-20 sm:right-10"
        />
      </PageHeader>
      <JudgeBoard initialClass={c.vehicle.class} ready={ready} content={c} />
    </>
  );
}
