"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { BonusList } from "@/components/public/BonusList";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { BONUS_ELEMENTS } from "@/lib/emma/bonus";
import type { PublicBonusRequest } from "@/lib/types";
import { EditPencil } from "@/components/public/EditMode";

export function BonusView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  // Public view: drop the editor-only `strength` field entirely.
  const reqs: PublicBonusRequest[] = c.bonus.map(
    ({ strength: _strength, ...r }) => {
      void _strength;
      return r;
    },
  );
  return (
    <>
      <section className="px-8 sm:px-[72px] lg:px-[88px] grid grid-cols-1 items-end gap-12 pb-16 pt-24 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="eyebrow text-amber">04 — Bonus Point</span>
          <h1
            className="display m-0 font-black"
            style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}
          >
            More than
            <br />
            just an install.
          </h1>
        </div>
        <p className="m-0 max-w-[620px] text-lg leading-[1.7] text-muted md:justify-self-end">
          Our bonus requests cover the whole car: glass, lights, rims, body,
          cabin and trunk. Each request is worth up to 3 points: 1 for the idea,
          plus 1 for average or 2 for good execution.
        </p>
      </section>

      <section
        aria-labelledby="elements"
        className="px-3 pb-20 sm:px-6 lg:px-10"
      >
        <h2
          id="elements"
          className="eyebrow m-0 mb-6 px-5 font-medium text-muted-2 sm:px-12"
        >
          Eligible elements
        </h2>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 p-0">
          {BONUS_ELEMENTS.map((e) => (
            <li
              key={e.key}
              className="glass-dark flex flex-col gap-4 rounded-[28px] p-7"
            >
              <span className="font-display text-5xl font-black leading-none text-amber">
                {e.key}
              </span>
              <span className="font-display text-[28px] font-extrabold leading-tight">
                {e.title}
              </span>
              <span className="text-[15px] leading-relaxed text-muted">
                {e.body}
              </span>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-5 px-5 text-sm text-muted-2 sm:px-12">
          Elements must be part of the installation; modifications that improve
          sound are scored on the sound sheet, not as bonus.
        </p>
      </section>

      <section aria-labelledby="requests" className="mx-3 sm:mx-6 lg:mx-10">
        <GlassPanel tone="light" className="relative rounded-[36px]">
          <EditPencil
            href="/editor/bonus/"
            label="Bonus requests"
            className="right-5 top-5"
            tone="light"
          />
          <div className="flex flex-col gap-8 px-5 py-16 sm:px-12 sm:py-20">
            <div className="flex flex-col gap-3">
              <span className="eyebrow text-navy">Request list</span>
              <h2 id="requests" className="display m-0 text-5xl font-extrabold">
                Bonus requests
              </h2>
              <p className="m-0 max-w-[720px] text-dark-muted">
                Submitted in a dedicated document, handed in with the
                presentation. Sound quality improvements do not count as bonus.
              </p>
            </div>
            <BonusList initial={reqs} />
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
