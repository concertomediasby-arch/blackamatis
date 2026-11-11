"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { BONUS_MODES, EXECUTION_LABELS, estimateBonus, requestPoints, type BonusMode, type Execution } from "@/lib/emma/bonus";

type Row = { title: string; idea: boolean; execution: Execution };

/** Personal estimate calculator. Not stored; final scores are set by the judges. */
export function BonusEstimate({ initial }: { initial: Row[] }) {
  const [mode, setMode] = useState<BonusMode>("limited");
  const [rows, setRows] = useState<Row[]>(initial);
  const est = estimateBonus(rows, mode);
  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <SegmentedTabs
          options={[
            { key: "limited", label: "Limited" },
            { key: "unlimited", label: "Unlimited" },
          ]}
          value={mode}
          onChange={setMode}
          label="Bonus class"
          tone="light"
        />
        <div aria-live="polite" className="flex items-baseline gap-3">
          <span className="font-display text-[72px] font-black leading-none">{est.score}</span>
          <span className="font-mono text-sm tracking-[0.1em] text-dark-muted">/ {est.cap} PTS</span>
        </div>
      </div>
      <p className="m-0 text-sm text-dark-muted">
        {mode === "limited" ? "Limited: up to 20 requests, 15 bonus points in total." : "Unlimited: up to 50 requests, 100 bonus points in total."}{" "}
        {rows.length} / {est.maxRequests} requests.
        {est.overCap && <strong className="text-black"> Over the request limit: only the first {est.maxRequests} count.</strong>}
      </p>

      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {rows.map((r, i) => {
          const no = String(i + 1).padStart(2, "0");
          return (
            <li key={i} className="grid grid-cols-1 items-center gap-4 rounded-3xl border border-black/15 bg-white/45 p-5 md:grid-cols-[48px_1fr_auto_auto_auto]">
              <span className="font-mono text-sm font-medium text-navy">{no}</span>
              <span className="font-semibold">{r.title}</span>
              <button
                type="button"
                aria-pressed={r.idea}
                onClick={() => update(i, { idea: !r.idea })}
                className={`pill border border-black ${r.idea ? "bg-black text-lemon" : "bg-transparent text-black"}`}
              >
                {r.idea ? "Idea submitted ✓ +1" : "Idea not submitted"}
              </button>
              <div role="radiogroup" aria-label={`Execution, request ${no}`} className="flex flex-wrap gap-1.5">
                {([0, 1, 2] as Execution[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={r.execution === v}
                    onClick={() => update(i, { execution: v })}
                    className={`pill border border-black/50 px-3.5 text-[13px] ${r.execution === v ? "bg-navy text-white" : "bg-transparent text-black"}`}
                  >
                    {EXECUTION_LABELS[v]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-black">{requestPoints(r)}</span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-dark-muted">PTS</span>
                <button
                  type="button"
                  onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                  aria-label={`Remove request ${no}`}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-black/10"
                >
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        disabled={rows.length >= BONUS_MODES[mode].maxRequests}
        onClick={() => setRows((rs) => [...rs, { title: `Request ${rs.length + 1}`, idea: false, execution: 0 }])}
        className="pill self-start border border-dashed border-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Add request
      </button>
      <p className="m-0 font-mono text-xs tracking-[0.08em] text-dark-muted">
        A personal estimate for preparation. Final scores are set by the judges.
      </p>
    </div>
  );
}
