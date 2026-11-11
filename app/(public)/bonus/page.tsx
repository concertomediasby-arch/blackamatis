import type { Metadata } from "next";
import { BonusEstimate } from "@/components/public/BonusEstimate";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Placeholder } from "@/components/ui/Placeholder";
import { BONUS_ELEMENTS } from "@/lib/emma/bonus";
import { getSiteContent } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Bonus Point",
  description: "Black Amatis bonus point requests and a personal estimate of the EMMA 2026 bonus score.",
};

export default async function BonusPage() {
  const c = await getSiteContent();
  const reqs = [...c.bonus].sort((a, b) => a.no - b.no);
  const el = (k: string) => BONUS_ELEMENTS.find((e) => e.key === k);
  return (
    <>
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 items-end gap-12 px-5 pb-16 pt-24 sm:px-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="eyebrow text-amber">04 — Bonus Point</span>
          <h1 className="display m-0 font-black" style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}>
            More than
            <br />
            just an install.
          </h1>
        </div>
        <p className="m-0 text-lg leading-[1.7] text-muted">
          Each bonus request is worth up to 3 points: 1 for the idea, plus 1 for average execution or 2 for good execution. Sound quality improvements do not
          count as bonus.
        </p>
      </section>

      <section aria-labelledby="elements" className="mx-auto max-w-[1360px] px-3 pb-20 sm:px-6 lg:px-10">
        <h2 id="elements" className="eyebrow m-0 mb-6 px-2 font-medium text-muted-2">
          Eligible elements
        </h2>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 p-0">
          {BONUS_ELEMENTS.map((e) => (
            <li key={e.key} className="glass-dark flex flex-col gap-4 rounded-[28px] p-7">
              <span className="font-display text-5xl font-black leading-none text-amber">{e.key}</span>
              <span className="font-display text-[28px] font-extrabold leading-tight">{e.title}</span>
              <span className="text-[15px] leading-relaxed text-muted">{e.body}</span>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-5 px-2 text-sm text-muted-2">
          Elements must be part of the installation; modifications that improve sound are scored on the sound sheet, not as bonus.
        </p>
      </section>

      <section aria-labelledby="requests" className="mx-auto max-w-[1360px] px-3 pb-20 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-3 px-2">
          <span className="eyebrow text-amber">Request list</span>
          <h2 id="requests" className="display m-0 text-5xl font-extrabold">
            Bonus requests
          </h2>
          <p className="m-0 text-muted">Submitted in a dedicated document, handed in with the presentation.</p>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 p-0">
          {reqs.map((r) => (
            <li key={r.id} className="glass-dark flex flex-col overflow-hidden rounded-[28px]">
              <Placeholder path={r.photo_path} label="Bonus element photo" alt={r.title} className="h-[220px] border-0 border-b" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="flex flex-col gap-3 p-7">
                <span className="label text-amber">
                  #{String(r.no).padStart(2, "0")} · Element {r.element} · {el(r.element)?.title}
                </span>
                <h3 className="display m-0 text-[30px] font-extrabold">{r.title}</h3>
                <p className="m-0 text-[15px] leading-relaxed text-muted">{r.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="estimate" className="mx-3 sm:mx-6 lg:mx-10">
        <GlassPanel tone="light" className="rounded-[36px]">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-20 sm:px-12">
            <div className="flex flex-col gap-3">
              <span className="eyebrow text-navy">Bonus estimate</span>
              <h2 id="estimate" className="display m-0 text-5xl font-extrabold">
                Estimate calculator
              </h2>
            </div>
            <BonusEstimate initial={reqs.map((r) => ({ title: r.title, idea: r.idea, execution: r.execution }))} />
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
