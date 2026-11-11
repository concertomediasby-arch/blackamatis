"use client";

import { useState } from "react";
import { circuitSheet, type SheetRow } from "@/lib/circuit-sheet";
import type { AudioComponent, Circuit } from "@/lib/types";
import { Run, STATUS, awgLabel, lengthLabel } from "./RunParts";

const RUN_LABEL: Record<SheetRow["run"], string> = { power: "POWER +", ground: "GROUND −", signal: "SIGNAL", speaker: "SPEAKER", other: "OTHER" };

function CheckCell({ r }: { r: SheetRow }) {
  const c = r.check;
  const tone = (ok: boolean | null) => (ok === false ? "text-[#FFB199]" : ok ? "text-lemon" : "text-muted");
  if (c?.kind === "fuse")
    return (
      <span className={`flex flex-col ${tone(c.ok)}`}>
        <span>
          {c.ok === false ? "⚠ " : c.ok ? "✓ " : ""}
          {c.fuseA != null ? `${c.fuseA} A` : "[__ A]"}
        </span>
        {c.maxA != null && <span className="text-[10px] text-muted">max {c.maxA} A</span>}
      </span>
    );
  if (c?.kind === "distance")
    return (
      <span className={`flex flex-col ${tone(c.ok)}`}>
        <span>
          {c.ok === false ? "⚠ " : c.ok ? "✓ " : ""}
          {lengthLabel(r.length_cm)}
        </span>
        <span className="text-[10px] text-muted">to fuse · max {c.maxCm} cm</span>
      </span>
    );
  if (r.run === "signal" && r.from) return <span className="text-muted">from {r.from}</span>;
  return <span className="text-muted">—</span>;
}

/**
 * Circuit as a data sheet: status, fuse, one table row per cable with its
 * VW75212 check, and the full path from the battery on request.
 */
export function CircuitSheet({
  circuit: c,
  circuits,
  components,
  titleId,
  onShowSpecs,
}: {
  circuit: Circuit;
  circuits: Circuit[];
  components: AudioComponent[];
  titleId: string;
  onShowSpecs?: () => void;
}) {
  const [full, setFull] = useState(false);
  const title = (k: string | null | undefined) => components.find((x) => x.key === k)?.title;
  const s = circuitSheet(c, circuits, title);
  const product = components.find((x) => x.key === c.component_key);
  const speaker = components.find((x) => x.key === c.cables.find((x) => x.role === "speaker" && x.to_key)?.to_key);
  const block = /^([A-Z])\d/i.exec(c.fuse_code ?? "")?.[1]?.toUpperCase();
  const eyebrow = c.kind === "trunk" ? "MAIN RUN" : c.fuse_code ? `CIRCUIT ${c.fuse_code}${block ? ` · FUSE BLOCK ${block}` : ""}` : "CIRCUIT";
  const subtitle = [product ? [product.title, product.brand].filter(Boolean).join(" · ") : null, speaker?.title].filter(Boolean).join(" → ");
  const status = STATUS[s.status];
  const where = [s.powerFrom && `Power from ${s.powerFrom}`, s.groundTo && `ground to ${s.groundTo}`].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 pr-10">
        <span className="font-mono text-[10px] tracking-[0.14em] text-amber">{eyebrow}</span>
        <h3 id={titleId} className="m-0 font-display text-[30px] font-black leading-none">
          {c.name}
        </h3>
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        {s.status !== "empty" && <span className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${status.cls}`}>{status.text}</span>}
        {product && onShowSpecs && (
          <button type="button" onClick={onShowSpecs} className="inline-flex min-h-11 cursor-pointer items-center text-[13px] font-semibold text-amber hover:text-lemon">
            Product specs →
          </button>
        )}
      </div>

      {(s.fuses.length > 0 || where) && (
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px]">
          {s.fuses.map((f, i) => (
            <div key={i} className="contents">
              <dt className="font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-muted-2">Fuse</dt>
              <dd className="m-0">
                {f.label} · <b className="text-amber">{f.fuse_a != null ? `${f.fuse_a} A` : "[__ A]"}</b>
              </dd>
            </div>
          ))}
          {where && (
            <>
              <dt className="font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-muted-2">Blocks</dt>
              <dd className="m-0">{where}</dd>
            </>
          )}
        </dl>
      )}

      {s.rows.length > 0 && (
        <table className="w-full border-collapse text-left text-[12px]">
          <caption className="sr-only">Cables of {c.name}, with the fuse check</caption>
          <thead>
            <tr className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-2">
              <th scope="col" className="border-b border-white/15 pb-1.5 pr-2 font-medium">
                Run
              </th>
              <th scope="col" className="border-b border-white/15 pb-1.5 pr-2 font-medium">
                Cable
              </th>
              <th scope="col" className="border-b border-white/15 pb-1.5 font-medium">
                Fuse check
              </th>
            </tr>
          </thead>
          <tbody>
            {s.rows.map((r) => {
              const checked = r.check && r.check.kind !== "none";
              const spec = [r.awg ? awgLabel(r.awg) : checked ? awgLabel(null) : null, r.length_cm != null ? lengthLabel(r.length_cm) : checked ? lengthLabel(null) : null]
                .filter(Boolean)
                .join(" · ");
              return (
                <tr key={r.id} className="align-top">
                  <th scope="row" className="border-b border-white/10 py-2 pr-2 font-normal">
                    <span className="block font-mono text-[9px] tracking-[0.12em] text-amber">{RUN_LABEL[r.run]}</span>
                    <span className="text-[12px]">→ {r.to || "—"}</span>
                  </th>
                  <td className="border-b border-white/10 py-2 pr-2">
                    <span className="block">{r.name || <span className="text-muted">Cable</span>}</span>
                    {spec && <span className="text-[11px] text-muted">{spec}</span>}
                  </td>
                  <td className="border-b border-white/10 py-2 font-mono text-[11px]">
                    <CheckCell r={r} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {c.kind === "channel" && (s.sharedPower > 0 || s.sharedGround > 0) && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={full}
            onClick={() => setFull((v) => !v)}
            className="inline-flex min-h-11 cursor-pointer items-center self-start text-[13px] font-semibold text-amber hover:text-lemon"
          >
            {full ? "Hide the path from the battery ▴" : "Show the full path from the battery ▾"}
          </button>
          {full && (
            <>
              <Run title="POWER (+)" items={s.power} shared={0} />
              <Run title="GROUND (−)" items={s.ground} shared={0} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
