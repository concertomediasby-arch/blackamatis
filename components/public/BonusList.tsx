"use client";

import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { normalizeMedia } from "@/lib/bonus-media";
import {
  BONUS_GROUPS,
  groupInfo,
  type BonusGroup,
} from "@/lib/emma/bonus-locations";
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
export function BonusList({
  initial,
  preview = false,
}: {
  initial: PublicBonusRequest[];
  /** Editor preview: no filter pills, the first row open on Idea. */
  preview?: boolean;
}) {
  const rows = [...initial].sort((a, b) => a.sort - b.sort);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Record<string, BonusTab | undefined>>(
    preview && rows[0] ? { [rows[0].id]: "idea" } : {},
  );

  const counts = Object.fromEntries(
    BONUS_GROUPS.map((g) => [
      g.key,
      rows.filter((r) => r.group === g.key).length,
    ]),
  );
  const filters = [
    { key: "all" as Filter, label: "All", count: rows.length },
    ...BONUS_GROUPS.filter((g) => g.key !== "new" || counts.new > 0).map(
      (g) => ({ key: g.key as Filter, label: g.label, count: counts[g.key] }),
    ),
  ];
  const visible =
    filter === "all" ? rows : rows.filter((r) => r.group === filter);

  return (
    <div className="flex flex-col gap-7">
      {!preview && (
        <SegmentedTabs
          options={filters}
          value={filter}
          onChange={setFilter}
          label="Filter by group"
          tone="light"
        />
      )}

      <ol
        className="m-0 flex list-none flex-col gap-2 p-0"
        aria-label="Bonus requests"
      >
        {visible.map((r) => {
          const name = r.title || "[Name the element]";
          const tab = open[r.id];
          const panelId = `bonus-${r.code}`;
          const n = {
            idea: 0,
            process: normalizeMedia(r.process).length,
            result: normalizeMedia(r.result).length,
          };
          return (
            <li
              key={r.id}
              className={`rounded-2xl border border-black/15 transition-colors ${tab ? "bg-white/75" : "bg-white/40 hover:bg-white/60"}`}
            >
              <button
                type="button"
                aria-expanded={!!tab}
                aria-controls={tab ? panelId : undefined}
                onClick={() =>
                  setOpen((o) => ({
                    ...o,
                    [r.id]: o[r.id] ? undefined : "idea",
                  }))
                }
                className="grid w-full cursor-pointer grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-4 rounded-2xl p-3 text-left sm:p-4"
              >
                <Placeholder
                  path={r.photo_path}
                  label="Photo"
                  alt=""
                  tone="light"
                  className="h-14 w-14 rounded-xl text-[8px]"
                  sizes="56px"
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-dark-muted">
                    <span className="font-medium text-navy">
                      {groupInfo(r.group).label.toUpperCase()}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>ELEMENT {r.element}</span>
                  </span>
                  <span className="text-[15px] font-semibold leading-snug">
                    {name}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="hidden font-mono text-[10px] tracking-[0.12em] text-dark-muted md:inline">
                    IDEA · PROCESS · RESULT
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-black/40 transition-transform ${tab ? "rotate-180 bg-black text-lemon" : ""}`}
                  >
                    ▾
                  </span>
                </span>
              </button>
              {tab && (
                <div className="flex flex-col gap-4 px-3 pb-4 sm:px-4">
                  <div
                    role="tablist"
                    aria-label={`${name}: details`}
                    className="flex flex-wrap gap-1.5 border-t border-black/15 pt-4"
                  >
                    {TABS.map((t) => {
                      const on = tab === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          role="tab"
                          aria-selected={on}
                          aria-controls={panelId}
                          onClick={() =>
                            setOpen((o) => ({ ...o, [r.id]: t.key }))
                          }
                          className={`pill border px-4 text-[13px] ${on ? "border-black bg-black text-lemon" : "border-black/50 bg-transparent text-black hover:bg-black/5"}`}
                        >
                          {t.label}
                          {n[t.key] > 0 && (
                            <span className="ml-1.5 font-mono text-[11px] opacity-70">
                              {n[t.key]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <BonusDetails request={r} id={panelId} tab={tab} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
