"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, PageTitle, btn } from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { saveEvidence } from "@/lib/editor/data";
import { judgedGroups } from "@/lib/emma/criteria";
import { CLASS_INFO, type CriterionKey } from "@/lib/emma/matrix";

/** Public pages and the tables their content comes from. */
const PAGES = [
  { name: "Home", href: "/", edit: "/editor/vehicle/", tables: ["vehicle", "team", "partners"] },
  { name: "History", href: "/history/", edit: "/editor/vehicle/#timeline", tables: ["vehicle", "milestones"] },
  { name: "Theme", href: "/theme/", edit: "/editor/theme/", tables: ["vehicle", "theme_zones", "moodboard_items"] },
  { name: "Installation", href: "/installation/", edit: "/editor/components/", tables: ["components", "wiring_links", "photos", "craft_photos"] },
  { name: "Bonus Point", href: "/bonus/", edit: "/editor/bonus/", tables: ["bonus_requests"] },
  { name: "Judge Mode", href: "/judge/", edit: "/editor/#checklist", tables: [] },
];

type PageStatus = { label: string; tone: "green" | "amber" | "grey"; last: string | null; lastBy: string | null };

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function OverviewPage() {
  const { content, update, session, dirty, unpublished, lastSaved, publishState, stateLoading } = useEditor();
  const cls = content.vehicle.class;
  const ready = Object.fromEntries(content.evidence.map((e) => [e.criterion_key, e.ready])) as Partial<Record<CriterionKey, boolean>>;
  const r = judgedGroups(cls, ready);
  const [err, setErr] = useState<string | null>(null);

  const editedBy = session.mode === "preview" ? "you (preview)" : session.email;
  const who = (id: string | null) => (!id ? null : session.mode === "supabase" && id === session.userId ? session.email : "another editor");

  const statusOf = (tables: string[]): PageStatus => {
    if (tables.length === 0) {
      const last = content.evidence.reduce<string | null>((a, e) => (e.updated_at && (!a || e.updated_at > a) ? e.updated_at : a), null);
      return { label: "Live · ticks save instantly", tone: "green", last, lastBy: null };
    }
    if (session.mode === "preview") {
      return { label: dirty || unpublished ? "Draft · not published yet" : "Published", tone: dirty || unpublished ? "amber" : "green", last: lastSaved, lastBy: editedBy };
    }
    if (stateLoading || !publishState) return { label: "Checking…", tone: "grey", last: null, lastBy: null };
    const st = tables.map((t) => publishState[t]).filter(Boolean);
    const latest = st.reduce<(typeof st)[number] | null>((a, x) => (x.last && (!a || !a.last || x.last > a.last) ? x : a), null);
    const base = { last: latest?.last ?? null, lastBy: who(latest?.lastBy ?? null) };
    if (st.some((x) => x.drafts > 0)) return { label: "Draft · not published yet", tone: "amber", ...base };
    if (st.every((x) => x.rows === 0)) return { label: "Placeholder · nothing saved yet", tone: "grey", ...base };
    return { label: "Published", tone: "green", ...base };
  };
  const DOT = { green: "bg-emerald-600", amber: "bg-amber", grey: "bg-[#B5B2BC]" };

  const tick = async (key: CriterionKey, value: boolean) => {
    update((c) => {
      const others = c.evidence.filter((e) => e.criterion_key !== key);
      return {
        ...c,
        evidence: [...others, { criterion_key: key, ready: value, note: "", updated_by: editedBy, updated_at: new Date().toISOString() }],
      };
    });
    const res = await saveEvidence(session, key, value);
    setErr(res.ok ? null : (res.error ?? "Could not save the tick"));
  };

  return (
    <>
      <PageTitle title="Overview">Every public page, its status and the pre-event evidence checklist.</PageTitle>
      <ul className="m-0 mb-8 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 p-0">
        {PAGES.map((p) => {
          const st = statusOf(p.tables);
          return (
          <li key={p.name}>
            <Card className="h-full">
              <div className="flex flex-col gap-1">
                <h2 className="m-0 text-lg font-bold">{p.name}</h2>
                <span className="flex items-center gap-2 text-sm text-[#4a4852]">
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DOT[st.tone]}`} />
                  {st.label}
                </span>
                <span className="text-[13px] text-[#55535c]">
                  {st.last ? `Last edited ${st.lastBy ? `by ${st.lastBy} · ` : ""}${when(st.last)}` : "Not edited yet"}
                </span>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <Link href={p.edit} className={btn.primary}>
                  Edit
                </Link>
                <a href={p.href} target="_blank" className={btn.secondary}>
                  Preview
                </a>
              </div>
            </Card>
          </li>
          );
        })}
      </ul>

      <div id="checklist">
        <Card
          title={`Pre-event checklist · Class ${CLASS_INFO[cls].label} (${CLASS_INFO[cls].name})`}
          actions={
            <Link href="/judge" className={btn.secondary}>
              Open Judge Mode
            </Link>
          }
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-semibold">
              <span>Evidence ready</span>
              <span>
                {r.readyPts} / {r.total} pts ({r.pct}%)
              </span>
            </div>
            <div role="progressbar" aria-label="Evidence ready" aria-valuemin={0} aria-valuemax={r.total} aria-valuenow={r.readyPts} className="h-3 overflow-hidden rounded-full bg-[#EAE7DD]">
              <div className="h-full bg-prussian transition-[width]" style={{ width: `${r.pct}%` }} />
            </div>
          </div>
          {err && (
            <p role="alert" className="m-0 text-sm text-red-700">
              {err}
            </p>
          )}
          {r.groups.map((g) => (
            <fieldset key={g.title} className="m-0 flex flex-col gap-1 border-0 p-0">
              <legend className="mb-2 flex w-full justify-between text-sm font-bold">
                {g.title} <span className="font-mono text-xs font-normal text-[#55535c]">{g.sum} PTS MAX</span>
              </legend>
              {g.items.map((it) => (
                <label key={it.key} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-[#FAF9F5]">
                  <input type="checkbox" checked={it.ready} onChange={(e) => void tick(it.key, e.target.checked)} className="mt-1 h-5 w-5 flex-none accent-prussian" />
                  <span className="flex flex-1 flex-col">
                    <span className="font-semibold">{it.name}</span>
                    <span className="text-[13px] text-[#55535c]">Evidence: {it.evidence}</span>
                  </span>
                  <span className="font-mono text-sm">{it.maxPts} pts</span>
                </label>
              ))}
            </fieldset>
          ))}
        </Card>
      </div>
    </>
  );
}
