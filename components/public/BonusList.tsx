"use client";

import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { normalizeMedia } from "@/lib/bonus-media";
import { BONUS_GROUPS, groupInfo, type BonusGroup } from "@/lib/emma/bonus-locations";
import type { PublicBonusRequest } from "@/lib/types";
import { BonusDetails, type BonusTab } from "./BonusDetails";

type Filter = "all" | BonusGroup;

const TABS: { key: BonusTab; label: string }[] = [
  { key: "idea", label: "Idea" },
  { key: "process", label: "Process" },
  { key: "result", label: "Result" },
];

/**
 * Bonus requests as a showcase: each row opens its Idea, Process and Result.
 * Scores and the Submit choice stay in the editor.
 */
export function BonusList({ initial }: { initial: PublicBonusRequest[] }) {
  const rows = [...initial].sort((a, b) => a.sort - b.sort);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Record<string, BonusTab | undefined>>({});

  const counts = Object.fromEntries(BONUS_GROUPS.map((g) => [g.key, rows.filter((r) => r.group === g.key).length]));
  const filters = [
    { key: "all" as Filter, label: "All", count: rows.length },
    ...BONUS_GROUPS.filter((g) => g.key !== "new" || counts.new > 0).map((g) => ({ key: g.key as Filter, label: g.label, count: counts[g.key] })),
  ];
  const visible = filter === "all" ? rows : rows.filter((r) => r.group === filter);

  return (
    <div className="flex flex-col gap-7">
      <SegmentedTabs options={filters} value={filter} onChange={setFilter} label="Filter by group" tone="light" />

      <ol className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Bonus requests">
        {visible.map((r) => {
          const name = r.title || "[Name the element]";
          const tab = open[r.id];
          const panelId = `bonus-${r.code}`;
          const n = { idea: 0, process: normalizeMedia(r.process).length, result: normalizeMedia(r.result).length };
          return (
            <li
              key={r.id}
              className={`grid grid-cols-[56px_1fr] items-center gap-x-4 gap-y-3 rounded-2xl border border-black/15 p-3 sm:p-4 lg:grid-cols-[56px_minmax(0,1fr)_auto] ${
                tab ? "bg-white/70" : "bg-white/40"
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
                <span className="text-[15px] font-semibold leading-snug">{name}</span>
              </div>
              <div role="group" aria-label={`${name}: details`} className="col-start-2 flex flex-wrap gap-1.5 lg:col-start-auto">
                {TABS.map((t) => {
                  const on = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      aria-expanded={on}
                      aria-controls={on ? panelId : undefined}
                      onClick={() => setOpen((o) => ({ ...o, [r.id]: on ? undefined : t.key }))}
                      className={`pill border px-4 text-[13px] ${on ? "border-black bg-black text-lemon" : "border-black/50 bg-transparent text-black hover:bg-black/5"}`}
                    >
                      {t.label}
                      {n[t.key] > 0 && <span className="ml-1.5 font-mono text-[11px] opacity-70">{n[t.key]}</span>}
                    </button>
                  );
                })}
              </div>
              {tab && <BonusDetails request={r} id={panelId} tab={tab} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
