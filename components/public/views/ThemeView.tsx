"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Placeholder } from "@/components/ui/Placeholder";
import { EditPencil } from "@/components/public/EditMode";

/** First image large; if an odd number of small ones remains, the last spans two columns. */
function moodSpan(i: number, n: number) {
  if (i === 0) return "col-span-2 row-span-2";
  return (n - 1) % 2 === 1 && i === n - 1 && n > 1 ? "col-span-2" : "";
}

export function ThemeView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  const mood = [...c.moodboard].sort((a, b) => a.sort - b.sort);
  const v = c.vehicle;
  return (
    <>
      <section
        aria-labelledby="two-face"
        className="grid grid-cols-1 gap-5 px-3 pt-8 sm:px-6 md:grid-cols-2 lg:px-10"
      >
        <GlassPanel className="relative flex min-h-[560px] flex-col justify-between gap-6 rounded-[36px] px-6 py-16 sm:px-14 sm:py-24">
          <EditPencil
            href="/editor/vehicle/#faces"
            label="Dark side"
            className="right-5 top-5"
          />
          <span className="eyebrow text-amber">02 — Theme</span>
          <div className="flex flex-col gap-5">
            <span className="label text-amber">{v.dark_side_name}</span>
            <h1
              id="two-face"
              className="display m-0 font-black"
              style={{ fontSize: "clamp(64px, 8vw, 120px)", lineHeight: 0.85 }}
            >
              TWO
              <br />
              FACE
            </h1>
            <p className="m-0 max-w-[460px] text-[17px] leading-[1.7] text-muted">
              {v.dark_side_body}
            </p>
          </div>
        </GlassPanel>
        <GlassPanel
          tone="light"
          className="relative flex min-h-[560px] flex-col justify-end gap-6 rounded-[36px] px-6 py-16 sm:px-14 sm:py-24"
        >
          <EditPencil
            href="/editor/vehicle/#faces"
            label="Light side"
            className="right-5 top-5"
            tone="light"
          />
          <div className="flex flex-col gap-5">
            <span className="label text-navy">{v.light_side_name}</span>
            <span
              aria-hidden="true"
              className="display font-black"
              style={{ fontSize: "clamp(64px, 8vw, 120px)", lineHeight: 0.85 }}
            >
              BLACK
              <br />
              AMATIS
            </span>
            <p className="m-0 max-w-[460px] text-[17px] leading-[1.7] text-dark-muted">
              {v.light_side_body}
            </p>
          </div>
        </GlassPanel>
      </section>

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

      <section aria-labelledby="moodboard" className="mx-3 sm:mx-6 lg:mx-10">
        <GlassPanel tone="light" className="relative rounded-[36px]">
          <EditPencil
            href="/editor/theme/#moodboard"
            label="Sketches and moodboard"
            className="right-5 top-5"
            tone="light"
          />
          <div className="flex flex-col gap-8 px-5 py-20 sm:px-12">
            <h2 id="moodboard" className="display m-0 text-5xl font-extrabold">
              Sketches &amp; moodboard
            </h2>
            <ul className="m-0 grid list-none auto-rows-[180px] grid-cols-2 gap-4 p-0 md:grid-cols-4">
              {mood.map((m, i) => (
                <li key={m.id} className={moodSpan(i, mood.length)}>
                  <Placeholder
                    path={m.path}
                    label={m.caption || "Moodboard image"}
                    alt={m.caption}
                    tone="light"
                    className="h-full rounded-2xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
