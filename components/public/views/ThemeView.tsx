"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Placeholder } from "@/components/ui/Placeholder";
import { EditPencil } from "@/components/public/EditMode";
import { MotifMap } from "@/components/public/MotifMap";
import { ThemeSides } from "@/components/public/ThemeSides";
import { themeLayoutOf } from "@/lib/page-layout";
import { normalizeMotifs } from "@/lib/theme";

export function ThemeView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  const v = c.vehicle;
  const motifs = normalizeMotifs(v.motifs);
  return (
    <>
      <ThemeSides v={v} layout={themeLayoutOf(v)} />

      {/* Hidden until the team has written at least one motif (editor › Theme › Motifs). */}
      {motifs.some((m) => m.title.trim() || m.meaning.trim()) && (
        <section
          id="motifs"
          aria-labelledby="motifs-title"
          className="relative px-3 pt-16 sm:px-6 lg:px-10"
        >
          <GlassPanel className="relative flex flex-col gap-8 rounded-[36px] p-5 sm:p-12">
            <EditPencil
              href="/editor/theme/#motifs"
              label="Motifs"
              className="right-5 top-5"
            />
            <div className="flex max-w-[680px] flex-col gap-3">
              <span className="eyebrow text-amber">Motifs &amp; meaning</span>
              <h2
                id="motifs-title"
                className="display m-0 text-[clamp(40px,5vw,56px)] font-extrabold"
              >
                Every line has a reason
              </h2>
              <p className="m-0 leading-[1.7] text-muted">
                Click a number on the car to see what the motif is and why it is
                there.
              </p>
            </div>
            <MotifMap photo={v.motif_photo_path ?? null} motifs={motifs} />
          </GlassPanel>
        </section>
      )}

      <section id="zones" aria-labelledby="zones-title" className="relative">
        <EditPencil
          href="/editor/theme/#zones"
          label="Theme zones"
          className="right-5 top-20 sm:right-10"
        />
        <div className="px-8 sm:px-[72px] lg:px-[88px] flex flex-col gap-4 pb-12 pt-24">
          <h2 id="zones-title" className="display m-0 text-5xl font-extrabold">
            The theme in every zone
          </h2>
          <p className="m-0 max-w-[720px] text-[17px] leading-[1.7] text-muted-2">
            Judges deduct 1 point for every element that does not follow the
            design idea. Every zone carries the same two-face concept.
          </p>
        </div>
        <ul className="px-8 sm:px-[72px] lg:px-[88px] m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 pb-24">
          {c.zones.map((z) => (
            <li
              key={z.key}
              className="glass-dark flex flex-col overflow-hidden rounded-[28px]"
            >
              <Placeholder
                path={z.photo_path}
                label={`${z.name} photo`}
                alt={z.name}
                className="h-[260px] border-0 border-b"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="flex flex-col gap-3.5 p-7">
                <span className="label text-amber">
                  Judge criterion · {z.criterion}
                </span>
                <h3 className="display m-0 text-[34px] font-extrabold">
                  {z.name}
                </h3>
                <ul className="m-0 flex flex-col gap-2 pl-5 text-[15px] leading-normal text-muted">
                  {z.elements.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
