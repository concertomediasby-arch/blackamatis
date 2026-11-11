"use client";

import { ContentFallback, useSiteContent } from "@/components/public/ContentProvider";
import { BeforeAfter } from "@/components/public/BeforeAfter";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Placeholder } from "@/components/ui/Placeholder";
import { EditPencil } from "@/components/public/EditMode";


export function HistoryView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  const ms = [...c.milestones].sort((a, b) => a.sort - b.sort);
  return (
    <>
      <section className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-end gap-12 px-5 pb-16 pt-24 sm:px-10 md:grid-cols-2">
        <EditPencil href="/editor/vehicle/#f-story" label="History summary" className="right-5 top-20 sm:right-10" />
        <div className="flex flex-col gap-4">
          <span className="eyebrow text-amber">01 — History</span>
          <h1 className="display m-0 font-black" style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}>
            From stock
            <br />
            to the stage.
          </h1>
        </div>
        <p className="m-0 text-lg leading-[1.7] text-muted">{c.vehicle.story}</p>
      </section>

      <section aria-labelledby="compare" className="mx-auto max-w-[1360px] px-3 pb-24 sm:px-6 lg:px-10">
        <GlassPanel className="relative rounded-[36px] p-5 sm:p-12">
          <EditPencil href="/editor/history/#before-after" label="Before and after photos" className="-top-5 right-8" />
          <BeforeAfter items={c.beforeAfter} />
        </GlassPanel>
      </section>

      <section aria-labelledby="timeline" className="relative mx-auto max-w-[1280px] px-5 pb-24 sm:px-10">
        <EditPencil href="/editor/vehicle/#timeline" label="Build timeline" className="right-5 top-0 sm:right-10" />
        <h2 id="timeline" className="display m-0 mb-12 text-5xl font-extrabold">
          Build timeline
        </h2>
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {ms.map((m) => (
            <li key={m.id} className="glass-dark grid grid-cols-1 items-start gap-4 rounded-3xl p-6 sm:grid-cols-[minmax(120px,200px)_1fr_minmax(0,220px)] sm:gap-8 sm:p-8">
              <span className="font-display text-[32px] font-bold leading-none text-amber">{m.when_label}</span>
              <div className="flex flex-col gap-2">
                <h3 className="m-0 font-display text-[28px] font-bold leading-tight">{m.title}</h3>
                <p className="m-0 leading-relaxed text-muted-2">{m.body}</p>
              </div>
              <Placeholder path={m.photo_path} label="Photo" alt={m.title} className="h-[120px] rounded-[20px] bg-[rgba(1,20,53,0.5)]" sizes="220px" />
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="events" className="mx-3 sm:mx-6 lg:mx-10">
        <GlassPanel tone="light" className="relative rounded-[36px]">
          <EditPencil href="/editor/history/#competitions" label="Competition history" className="right-5 top-5" tone="light" />
          <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-5 py-20 sm:px-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="events" className="display m-0 text-5xl font-extrabold">
                Competition history
              </h2>
              <span className="font-mono text-xs tracking-[0.12em] text-dark-muted">UPDATED AFTER EACH EVENT</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[15px]">
                <thead>
                  <tr className="text-left font-mono text-[11px] tracking-[0.12em] text-dark-muted">
                    {["EVENT", "CITY", "CATEGORY", "INSTALL POINTS", "RESULT"].map((h) => (
                      <th key={h} scope="col" className="border-b-2 border-black py-3 pr-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.competitions.map((e) => (
                    <tr key={e.id}>
                      <th scope="row" className="border-b border-[#C2B50C] py-4 pr-4 text-left font-semibold">
                        {e.event}
                      </th>
                      <td className="border-b border-[#C2B50C] py-4 pr-4">{e.city}</td>
                      <td className="border-b border-[#C2B50C] py-4 pr-4">{e.category}</td>
                      <td className="border-b border-[#C2B50C] py-4 pr-4">{e.install_points}</td>
                      <td className="border-b border-[#C2B50C] py-4">{e.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
