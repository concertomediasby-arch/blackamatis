"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { EditPencil } from "@/components/public/EditMode";
import { MotifMap } from "@/components/public/MotifMap";
import { ThemeSides } from "@/components/public/ThemeSides";
import { ZoneCards } from "@/components/public/ZoneCards";
import { themeLayoutOf } from "@/lib/page-layout";
import { motifPhotos, normalizeMotifs } from "@/lib/theme";

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
            <MotifMap photos={motifPhotos(v)} motifs={motifs} />
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
            The result: one wayang story told across the whole car. Shadow Play
            and Limelight meet in a straight line over the bonnet, the Batik
            Malang theme glows in the head and tail lights, and every zone below
            carries the same two faces, from the outside in.
          </p>
        </div>
        <ZoneCards zones={c.zones} />
      </section>
    </>
  );
}
