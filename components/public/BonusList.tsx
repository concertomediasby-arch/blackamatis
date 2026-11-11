"use client";

import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { BONUS_MODES, DEFAULT_BONUS_MODE, EXECUTION_LABELS, estimateBonus, requestPoints, type BonusMode, type Execution } from "@/lib/emma/bonus";
import { BONUS_GROUPS, bonusCode, groupInfo, nextBonusNo, type BonusGroup } from "@/lib/emma/bonus-locations";
import type { PublicBonusRequest } from "@/lib/types";

type Row = PublicBonusRequest & { added?: boolean };
type Filter = "all" | BonusGroup;

/**
 * Compact, data-driven bonus request list with a personal estimate.
 * Ticks here are local to the visitor; the team's saved values come from the editor.
 */
export function BonusList({ initial }: { initial: PublicBonusRequest[] }) {
  const [rows, setRows] = useState<Row[]>(() => [...initial].sort((a, b) => a.sort - b.sort));
  const [mode, setMode] = useState<BonusMode>(DEFAULT_BONUS_MODE);
  const [filter, setFilter] = useState<Filter>("all");

  const est = estimateBonus(rows, mode);
  const cls = BONUS_MODES[mode];
  const patch = (id: string, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const counts = Object.fromEntries(BONUS_GROUPS.map((g) => [g.key, rows.filter((r) => r.group === g.key).length]));
  const filters = [
    { key: "all" as Filter, label: "All", count: rows.length },
    ...BONUS_GROUPS.filter((g) => g.key !== "new" || counts.new > 0).map((g) => ({ key: g.key as Filter, label: g.label, count: counts[g.key] })),
  ];
  const visible = filter === "all" ? rows : rows.filter((r) => r.group === filter);

  const add = () => {
    const no = nextBonusNo(rows);
    setRows((rs) => [
      ...rs,
      {
        id: `local-${no}`,
        no,
        code: bonusCode("new", no),
        group: "new",
        title: "",
        element: "—",
        description: "",
        photo_path: null,
        submit: false,
        idea: false,
        execution: 0,
        sort: rs.length + 1,
        added: true,
      },
    ]);
    if (filter !== "all") setFilter("new");
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <span className="label text-dark-muted">Bonus class</span>
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
          <span className="text-sm text-dark-muted">
            {cls.label}: up to {cls.maxRequests} requests, {cls.cap} bonus points in total.
          </span>
        </div>
        <div aria-live="polite" className="flex flex-col items-end gap-1">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-[72px] font-black leading-none">{est.score}</span>
            <span className="font-mono text-sm tracking-[0.1em] text-dark-muted">/ {est.cap} PTS</span>
          </span>
          <span className="font-mono text-xs tracking-[0.14em]">
            SUBMITTED {est.submitted} / {est.maxRequests}
          </span>
        </div>
      </div>

      {est.tooManyCandidates && (
        <p role="status" className="m-0 rounded-2xl bg-black px-5 py-3.5 text-[15px] text-lemon">
          {est.candidates} candidates listed. {cls.label} allows {cls.maxRequests} requests, so tick the strongest {cls.maxRequests} with Submit before the
          presentation.
        </p>
      )}
      {est.overSubmitted && (
        <p role="alert" className="m-0 rounded-2xl border-2 border-black px-5 py-3.5 text-[15px]">
          {est.submitted} requests ticked. Only the first {cls.maxRequests} in the list count towards the estimate.
        </p>
      )}

      <SegmentedTabs options={filters} value={filter} onChange={setFilter} label="Filter by group" tone="light" />

      <ol className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Bonus requests">
        {visible.map((r) => {
          const pts = requestPoints(r);
          const name = r.title || "New request";
          return (
            <li
              key={r.id}
              className={`grid grid-cols-[56px_1fr] items-center gap-x-4 gap-y-3 rounded-2xl border border-black/15 p-3 sm:p-4 lg:grid-cols-[56px_minmax(0,1fr)_auto_auto_auto_64px] ${
                r.submit ? "bg-white/70" : "bg-white/35"
              }`}
            >
              <Placeholder path={r.photo_path} label="Photo" alt={name} tone="light" className="h-14 w-14 rounded-xl text-[8px]" sizes="56px" />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-dark-muted">
                  <span className="font-medium text-navy">{r.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{groupInfo(r.group).label.toUpperCase()}</span>
                  <span aria-hidden="true">·</span>
                  <span>ELEMENT {r.element}</span>
                </span>
                {r.added ? (
                  <label className="flex flex-col gap-1">
                    <span className="sr-only">Name for request {r.code}</span>
                    <input
                      value={r.title}
                      onChange={(e) => patch(r.id, { title: e.target.value })}
                      placeholder="[Name the element]"
                      className="min-h-11 rounded-lg border border-black/30 bg-white px-3 text-[15px] font-semibold"
                    />
                  </label>
                ) : (
                  <span className="text-[15px] font-semibold leading-snug">{name}</span>
                )}
              </div>
              <label className="col-start-2 flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-semibold lg:col-start-auto">
                <input type="checkbox" checked={r.submit} onChange={(e) => patch(r.id, { submit: e.target.checked })} className="h-5 w-5 accent-black" />
                Submit
              </label>
              <div className="col-start-2 flex flex-wrap items-center gap-1.5 lg:col-start-auto">
                <button
                  type="button"
                  aria-pressed={r.idea}
                  aria-label={`Idea +1, ${r.code}`}
                  onClick={() => patch(r.id, { idea: !r.idea })}
                  className={`pill min-w-[84px] border border-black px-3 text-[13px] ${r.idea ? "bg-black text-lemon" : "bg-transparent text-black"}`}
                >
                  Idea +1
                </button>
              </div>
              <div role="radiogroup" aria-label={`Execution, ${r.code}`} className="col-start-2 flex flex-wrap gap-1.5 lg:col-start-auto">
                {([0, 1, 2] as Execution[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={r.execution === v}
                    onClick={() => patch(r.id, { execution: v })}
                    className={`pill border border-black/50 px-3 text-[13px] ${r.execution === v ? "bg-navy text-white" : "bg-transparent text-black"}`}
                  >
                    {EXECUTION_LABELS[v]}
                  </button>
                ))}
              </div>
              <span className={`col-start-2 flex items-baseline gap-1.5 lg:col-start-auto lg:justify-end ${r.submit ? "" : "opacity-50"}`}>
                <span className="font-display text-3xl font-black">{pts}</span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-dark-muted">PTS</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={add} className="pill border border-dashed border-black">
          + Add request
        </button>
        <p className="m-0 font-mono text-xs tracking-[0.08em] text-dark-muted">
          A personal estimate for preparation. Only rows ticked Submit count. Final scores are set by the judges.
        </p>
      </div>
    </div>
  );
}
