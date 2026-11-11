"use client";

import Link from "next/link";
import { useState } from "react";
import { judgedGroups } from "@/lib/emma/criteria";
import {
  CLASSES,
  CLASS_INFO,
  type CriterionKey,
  type EmmaClass,
} from "@/lib/emma/matrix";
import type { SiteContent } from "@/lib/types";
import { EditPencil } from "@/components/public/EditMode";

type Props = {
  initialClass: EmmaClass;
  ready: Partial<Record<CriterionKey, boolean>>;
  content: SiteContent;
};

/** Category selector + criteria list. Evidence ticks are read-only here (set in the editor). */
export function JudgeBoard({ initialClass, ready, content }: Props) {
  const [cls, setCls] = useState<EmmaClass>(initialClass);
  const [pdfState, setPdfState] = useState<"idle" | "busy" | "error">("idle");
  const downloadPdf = async () => {
    setPdfState("busy");
    try {
      const { downloadEvidencePack } = await import("@/lib/pdf/evidencePack");
      await downloadEvidencePack(content, cls);
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  };
  const r = judgedGroups(cls, ready);

  const facts = [
    {
      big: "40 cm",
      text: "Maximum distance from the positive battery post to the main fuse.",
    },
    {
      big: cls === "XU" ? "15 min" : "7 min",
      text: "Time to explain the system to the judges. No videos.",
    },
    {
      big: "3 min",
      text: "All component fuses must be shown within this time, in total.",
    },
    {
      big: "3 pts",
      text: "Maximum per bonus request: 1 for the idea, up to 2 for execution.",
    },
  ];

  return (
    <>
      <section aria-labelledby="class-title" className="mx-3 sm:mx-6 lg:mx-10">
        <div className="glass-light on-light rounded-[36px]">
          <div className="grid grid-cols-1 gap-10 px-5 py-14 sm:px-12 lg:grid-cols-[3fr_2fr]">
            <div className="flex flex-col gap-5">
              <span className="eyebrow text-navy">EMMA category</span>
              <h2
                id="class-title"
                className="display m-0 text-[clamp(36px,4vw,48px)] font-extrabold"
              >
                Choose a class
              </h2>
              <div
                role="group"
                aria-label="EMMA class"
                className="flex flex-wrap gap-2.5"
              >
                {CLASSES.map((k) => {
                  const on = k === cls;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setCls(k)}
                      className={`flex min-h-[64px] min-w-[88px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-black px-4 ${
                        on
                          ? "bg-black text-lemon"
                          : "bg-transparent text-black hover:bg-black/10"
                      }`}
                    >
                      <span className="font-display text-2xl font-black leading-none">
                        {CLASS_INFO[k].label}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.12em]">
                        {CLASS_INFO[k].name.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p
                className="m-0 text-[15px] leading-relaxed text-dark-muted"
                aria-live="polite"
              >
                {CLASS_INFO[cls].note}
              </p>
            </div>
            <dl className="m-0 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 rounded-3xl bg-black p-6 text-lemon">
                <dt className="label">Maximum points</dt>
                <dd className="m-0 font-display text-[64px] font-black leading-none">
                  {r.total}
                </dd>
              </div>
              <div className="flex flex-col gap-2 rounded-3xl border-2 border-black p-6">
                <dt className="label">Judged criteria</dt>
                <dd className="m-0 font-display text-[64px] font-black leading-none">
                  {r.count}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="ready-title"
        className="px-3 pt-16 sm:px-6 lg:px-10"
      >
        <div className="glass-dark relative flex flex-col gap-4 rounded-[36px] p-6 sm:p-10">
          <EditPencil
            href="/editor/#checklist"
            label="Evidence checklist"
            className="-top-5 right-8"
          />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="ready-title" className="eyebrow m-0 font-medium text-amber">
              Evidence ready
            </h2>
            <span className="font-display text-4xl font-black">
              {r.readyPts} <span className="text-muted-2">/ {r.total} pts</span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Evidence ready"
            aria-valuemin={0}
            aria-valuemax={r.total}
            aria-valuenow={r.readyPts}
            aria-valuetext={`${r.pct}% — ${r.readyPts} of ${r.total} points have evidence ready`}
            className="h-4 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-amber transition-[width] duration-500"
              style={{ width: `${r.pct}%` }}
            />
          </div>
          <span className="text-sm text-muted">
            {r.pct}% of points have evidence ticked by the team. Ticks are
            updated in the editor.
          </span>
        </div>
      </section>

      <section
        aria-labelledby="rules-title"
        className="px-3 pt-16 sm:px-6 lg:px-10"
      >
        <h2
          id="rules-title"
          className="eyebrow m-0 mb-6 px-2 font-medium text-muted-2"
        >
          Key rules
        </h2>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 p-0">
          {facts.map((f) => (
            <li
              key={f.text}
              className="glass-dark flex flex-col gap-3 rounded-[28px] p-7"
            >
              <span className="font-display text-5xl font-black leading-none text-amber">
                {f.big}
              </span>
              <span className="text-[15px] leading-relaxed text-muted">
                {f.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="criteria-title"
        className="px-3 pt-16 sm:px-6 lg:px-10"
      >
        <h2 id="criteria-title" className="sr-only">
          Criteria
        </h2>
        <div className="flex flex-col gap-8">
          {r.groups.map((g) => (
            <div
              key={g.title}
              className="glass-dark overflow-hidden rounded-[36px]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-6 sm:px-10">
                <h3 className="display m-0 text-[32px] font-extrabold">
                  {g.title}
                </h3>
                <span className="font-mono text-xs tracking-[0.14em] text-amber">
                  {g.sum} PTS MAX
                </span>
              </div>
              <ul className="m-0 list-none p-0">
                {g.items.map((it) => (
                  <li
                    key={it.key}
                    className="grid grid-cols-[32px_1fr] items-start gap-x-4 gap-y-3 border-b border-white/10 px-6 py-6 last:border-0 sm:grid-cols-[32px_1fr_1fr_88px] sm:px-10"
                  >
                    <span
                      role="img"
                      aria-label={
                        it.ready ? "Evidence ready" : "Evidence not ready"
                      }
                      className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg border-2 text-prussian"
                      style={{
                        background: it.ready ? "#E5A90A" : "transparent",
                        borderColor: it.ready
                          ? "#E5A90A"
                          : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {it.ready && (
                        <svg
                          aria-hidden="true"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                      )}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-lg font-semibold">{it.name}</span>
                      <span className="text-sm leading-relaxed text-muted">
                        {it.check}
                      </span>
                    </div>
                    <div className="col-start-2 flex flex-col gap-1.5 sm:col-start-auto">
                      <span className="label text-muted-2">Evidence</span>
                      <span className="text-sm">{it.evidence}</span>
                      <Link
                        href={it.href}
                        className="inline-flex min-h-11 items-center text-sm font-semibold text-amber hover:text-lemon"
                      >
                        View in {it.linkLabel} →
                      </Link>
                    </div>
                    <div className="col-start-2 flex flex-col items-start gap-1 sm:col-start-auto sm:items-end">
                      <span className="font-mono text-[10px] tracking-[0.14em] text-muted-2">
                        MAX PTS
                      </span>
                      <span className="font-display text-[40px] font-black leading-none">
                        {it.maxPts}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => void downloadPdf()}
            disabled={pdfState === "busy"}
            className="pill min-h-12 cursor-pointer bg-amber px-7 text-prussian disabled:opacity-60"
          >
            {pdfState === "busy"
              ? "Preparing PDF…"
              : "Download evidence pack (PDF)"}
          </button>
          {pdfState === "error" && (
            <p role="alert" className="m-0 text-sm text-muted">
              The PDF could not be created in this browser. Please try again.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
