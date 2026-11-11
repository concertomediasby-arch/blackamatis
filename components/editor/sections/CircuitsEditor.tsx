"use client";

/* eslint-disable @next/next/no-img-element -- the drawing overlay must match the image box exactly */
import { useRef, useState } from "react";
import { CableDiagram } from "@/components/public/CableDiagram";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { normalizeCircuit } from "@/lib/circuits";
import { analyseChain, chainStatus } from "@/lib/emma/chain";
import { spotFromDrag, type Hotspot } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";
import type { ChainItem, Circuit, SideCable } from "@/lib/types";
import { useEditor } from "../EditorProvider";
import { Card, SelectField, TextField, btn } from "../Field";

const newId = () => crypto.randomUUID();
const inputCls = "min-h-11 w-full rounded-xl border border-editor-border bg-white px-3 text-[14px]";
const STATUS_TEXT = {
  ok: ["✓ Fuses match VW75212", "bg-emerald-50 text-emerald-900 border-emerald-300"],
  over: ["⚠ A cable is thinner than its fuse allows", "bg-red-50 text-red-800 border-red-200"],
  incomplete: ["Some cable sizes or fuse ratings are missing", "bg-[#FFF6CC] text-[#4a4200] border-[#E6DF63]"],
  empty: ["No fused cables yet", "bg-slate-50 text-slate-700 border-slate-200"],
} as const;

function Mini({ label, children, w = "" }: { label: string; children: React.ReactNode; w?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-[12px] font-semibold ${w}`}>
      {label}
      {children}
    </label>
  );
}

function RowTools({ i, n, onMove, onRemove, what }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void; what: string }) {
  return (
    <div className="flex gap-1 self-end">
      <button type="button" className={btn.ghost} disabled={i === 0} onClick={() => onMove(-1)} aria-label={`Move ${what} up`}>
        ↑
      </button>
      <button type="button" className={btn.ghost} disabled={i === n - 1} onClick={() => onMove(1)} aria-label={`Move ${what} down`}>
        ↓
      </button>
      <button type="button" className={btn.ghost} onClick={onRemove} aria-label={`Remove ${what}`}>
        ✕
      </button>
    </div>
  );
}

const moved = <T,>(list: T[], i: number, d: -1 | 1) => {
  const next = [...list];
  [next[i], next[i + d]] = [next[i + d], next[i]];
  return next;
};

/** Parts and cables of a power or ground run, in order from the battery. */
function ChainEditor({ title, hint, items, onChange, fuses }: { title: string; hint: string; items: ChainItem[]; onChange: (v: ChainItem[]) => void; fuses: boolean }) {
  const patch = (id: string, p: Partial<ChainItem>) => onChange(items.map((x) => (x.id === id ? ({ ...x, ...p } as ChainItem) : x)));
  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-xl border border-editor-border p-4">
      <legend className="px-1 text-sm font-bold">{title}</legend>
      <p className="m-0 text-[13px] text-[#4a4852]">{hint}</p>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((it, i) => (
          <li key={it.id} className={`flex flex-wrap items-end gap-2 rounded-xl p-2 ${it.t === "cable" ? "ml-6 border-l-4 border-[#E6DF63] bg-[#FFFDF0]" : "bg-[#FAF9F5]"}`}>
            {it.t === "node" ? (
              <>
                <Mini label="Part" w="min-w-[180px] flex-1">
                  <input className={inputCls} value={it.label} onChange={(e) => patch(it.id, { label: e.target.value })} placeholder="e.g. Distribution A" />
                </Mini>
                {fuses && (
                  <Mini label="Fuse (A)" w="w-28">
                    <input
                      className={inputCls}
                      type="number"
                      min={0}
                      value={it.fuse_a ?? ""}
                      onChange={(e) => patch(it.id, { fuse_a: e.target.value === "" ? null : Number(e.target.value), is_fuse: e.target.value !== "" || /fuse/i.test(it.label) })}
                      placeholder={it.is_fuse ? "rating?" : "none"}
                    />
                  </Mini>
                )}
              </>
            ) : (
              <>
                <Mini label="Cable" w="min-w-[160px] flex-1">
                  <input className={inputCls} value={it.name} onChange={(e) => patch(it.id, { name: e.target.value })} placeholder="e.g. Diosdela" />
                </Mini>
                <Mini label="AWG" w="w-24">
                  <input className={inputCls} value={it.awg ?? ""} onChange={(e) => patch(it.id, { awg: e.target.value.trim() || null })} placeholder="e.g. 4" />
                </Mini>
                <Mini label="Length (cm)" w="w-28">
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    value={it.length_cm ?? ""}
                    onChange={(e) => patch(it.id, { length_cm: e.target.value === "" ? null : Number(e.target.value) })}
                  />
                </Mini>
              </>
            )}
            <RowTools i={i} n={items.length} what={it.t === "node" ? it.label || "part" : "cable"} onMove={(d) => onChange(moved(items, i, d))} onRemove={() => onChange(items.filter((x) => x.id !== it.id))} />
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn.secondary} onClick={() => onChange([...items, { id: newId(), t: "cable", name: "", awg: null, length_cm: null }])}>
          + Cable
        </button>
        <button type="button" className={btn.secondary} onClick={() => onChange([...items, { id: newId(), t: "node", label: "", fuse_a: null }])}>
          + Part
        </button>
        {fuses && (
          <button type="button" className={btn.secondary} onClick={() => onChange([...items, { id: newId(), t: "node", label: "Fuse", fuse_a: null, is_fuse: true }])}>
            + Fuse
          </button>
        )}
      </div>
    </fieldset>
  );
}

function CablesEditor({ items, onChange, products }: { items: SideCable[]; onChange: (v: SideCable[]) => void; products: { key: string; title: string }[] }) {
  const patch = (id: string, p: Partial<SideCable>) => onChange(items.map((x) => (x.id === id ? { ...x, ...p } : x)));
  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-xl border border-editor-border p-4">
      <legend className="px-1 text-sm font-bold">Signal & speaker cables</legend>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((c, i) => (
          <li key={c.id} className="flex flex-wrap items-end gap-2 rounded-xl bg-[#FAF9F5] p-2">
            <Mini label="Type" w="w-32">
              <select className={inputCls} value={c.role} onChange={(e) => patch(c.id, { role: e.target.value as SideCable["role"] })}>
                <option value="signal">Signal (RCA)</option>
                <option value="speaker">Speaker</option>
                <option value="other">Other</option>
              </select>
            </Mini>
            <Mini label="From" w="w-32">
              <input className={inputCls} value={c.from} onChange={(e) => patch(c.id, { from: e.target.value })} />
            </Mini>
            <Mini label="To" w="w-40">
              <input className={inputCls} value={c.to} onChange={(e) => patch(c.id, { to: e.target.value })} />
            </Mini>
            <Mini label="Product at the end" w="w-40">
              <select className={inputCls} value={c.to_key ?? ""} onChange={(e) => patch(c.id, { to_key: e.target.value || null })}>
                <option value="">—</option>
                {products.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.title}
                  </option>
                ))}
              </select>
            </Mini>
            <Mini label="Cable" w="min-w-[140px] flex-1">
              <input className={inputCls} value={c.name} onChange={(e) => patch(c.id, { name: e.target.value })} />
            </Mini>
            <Mini label="AWG" w="w-20">
              <input className={inputCls} value={c.awg ?? ""} onChange={(e) => patch(c.id, { awg: e.target.value.trim() || null })} />
            </Mini>
            <Mini label="Length (cm)" w="w-28">
              <input
                className={inputCls}
                type="number"
                min={0}
                value={c.length_cm ?? ""}
                onChange={(e) => patch(c.id, { length_cm: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Mini>
            <RowTools i={i} n={items.length} what="cable" onMove={(d) => onChange(moved(items, i, d))} onRemove={() => onChange(items.filter((x) => x.id !== c.id))} />
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={`${btn.secondary} self-start`}
        onClick={() => onChange([...items, { id: newId(), role: "signal", from: "", to: "", to_key: null, name: "", awg: null, length_cm: null }])}
      >
        + Cable
      </button>
    </fieldset>
  );
}

/** Drag boxes over the cable diagram for the selected circuit; other circuits' boxes are shown dashed. */
function BoxMarker({ url, circuits, selected, onChange }: { url: string; circuits: Circuit[]; selected: Circuit; onChange: (spots: Hotspot[]) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<{ a: { x: number; y: number }; b: { x: number; y: number } } | null>(null);
  const pt = (e: React.PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) };
  };
  const draftSpot = draft ? spotFromDrag(draft.a, draft.b) : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl bg-prussian p-3 sm:p-5">
        <div
          ref={boxRef}
          role="application"
          aria-label={`Cable diagram. Drag to add a box for ${selected.name || "this circuit"}.`}
          className="relative cursor-crosshair touch-none select-none"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            const p = pt(e);
            setDraft({ a: p, b: p });
          }}
          onPointerMove={(e) => draft && setDraft({ ...draft, b: pt(e) })}
          onPointerUp={() => {
            if (draftSpot) onChange([...selected.wiring_hotspots, draftSpot]);
            setDraft(null);
          }}
        >
          <img src={url} alt="" draggable={false} className="block h-auto w-full rounded-lg" />
          {circuits.flatMap((c) =>
            c.wiring_hotspots.map((s, i) => {
              const mine = c.id === selected.id;
              return (
                <div
                  key={`${c.id}-${i}`}
                  className={`pointer-events-none absolute rounded-md ${mine ? "border-2 border-amber bg-amber/25" : "border border-dashed border-white/70 bg-white/5"}`}
                  style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
                >
                  <span
                    className={`absolute left-0 top-0 max-w-[160px] -translate-y-full truncate rounded px-1 text-[10px] font-semibold ${mine ? "bg-amber text-prussian" : "bg-black/70 text-white"}`}
                  >
                    {c.name}
                  </span>
                </div>
              );
            }),
          )}
          {draftSpot && (
            <div
              className="pointer-events-none absolute rounded-md border-2 border-dashed border-amber bg-amber/20"
              style={{ left: `${draftSpot.x}%`, top: `${draftSpot.y}%`, width: `${draftSpot.w}%`, height: `${draftSpot.h}%` }}
            />
          )}
        </div>
      </div>
      {selected.wiring_hotspots.length > 0 && (
        <ol className="m-0 flex list-none flex-wrap gap-2 p-0">
          {selected.wiring_hotspots.map((s, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border border-editor-border bg-white px-3 py-1 text-[12px]">
              Box {i + 1}: {s.x}%, {s.y}% · {s.w}×{s.h}%
              <button type="button" className={btn.ghost} onClick={() => onChange(selected.wiring_hotspots.filter((_, j) => j !== i))} aria-label={`Remove box ${i + 1}`}>
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * Editor › Components › Cable diagram circuits: the main runs (battery to the
 * distribution and ground blocks) and one circuit per device, with every cable,
 * fuse and the boxes that make it clickable on the cable diagram.
 */
export function CircuitsEditor() {
  const { content, update } = useEditor();
  const list = (content.circuits ?? []).map(normalizeCircuit).sort((a, b) => a.sort - b.sort);
  const [sel, setSel] = useState<string | null>(list[0]?.id ?? null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const current = list.find((c) => c.id === sel) ?? null;
  const trunks = list.filter((c) => c.kind === "trunk");
  const products = [...content.components].sort((a, b) => a.sort - b.sort).map((c) => ({ key: c.key, title: c.title }));
  const url = storageUrl(content.vehicle.wiring_diagram_path);

  const setList = (next: Circuit[]) => update((c) => ({ ...c, circuits: next.map((x, i) => ({ ...x, sort: i + 1 })) }));
  const patch = (p: Partial<Circuit>) => current && setList(list.map((c) => (c.id === current.id ? { ...c, ...p } : c)));
  const add = (kind: Circuit["kind"]) => {
    const c: Circuit = {
      id: newId(),
      name: kind === "trunk" ? "Main run" : "New circuit",
      kind,
      component_key: null,
      power_from: kind === "channel" ? (trunks[0]?.id ?? null) : null,
      ground_from: kind === "channel" ? (trunks[0]?.id ?? null) : null,
      power: [],
      ground: [],
      cables: [],
      wiring_hotspots: [],
      sort: list.length + 1,
    };
    setList([...list, c]);
    setSel(c.id);
  };

  const trunkP = trunks.find((t) => t.id === current?.power_from);
  const status = current ? chainStatus(analyseChain([...(current.kind === "channel" ? (trunkP?.power ?? []) : []), ...current.power])) : "empty";

  return (
    <Card title="Cable diagram circuits" id="circuits">
      <p className="m-0 text-sm text-[#4a4852]">
        Each circuit opens when its box on the cable diagram is clicked. A <b>main run</b> goes from the battery to a distribution and ground block; a{" "}
        <b>circuit</b> continues from a main run to one device. Cables are checked against VW75212 by the nearest fuse before them.
      </p>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[260px_1fr]">
        <div className="flex flex-col gap-2">
          <ol className="m-0 flex max-h-[520px] list-none flex-col gap-1 overflow-y-auto p-0">
            {list.map((c, i) => (
              <li key={c.id} className="flex items-center gap-1">
                <button
                  type="button"
                  aria-pressed={c.id === sel}
                  onClick={() => setSel(c.id)}
                  className={`flex min-h-11 flex-1 cursor-pointer flex-col items-start justify-center rounded-xl px-3 py-1 text-left ${c.id === sel ? "bg-lemon text-prussian" : "hover:bg-[#FAF9F5]"}`}
                >
                  <span className="text-sm font-semibold">{c.name || "Untitled"}</span>
                  <span className="font-mono text-[11px] text-[#55535c]">
                    {c.kind === "trunk" ? "MAIN RUN" : c.fuse_code ? `FUSE ${c.fuse_code}` : "CIRCUIT"} · {c.wiring_hotspots.length} box{c.wiring_hotspots.length === 1 ? "" : "es"}
                  </span>
                </button>
                <button type="button" className={btn.ghost} disabled={i === 0} onClick={() => setList(moved(list, i, -1))} aria-label={`Move ${c.name} up`}>
                  ↑
                </button>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn.secondary} onClick={() => add("channel")}>
              + Circuit
            </button>
            <button type="button" className={btn.secondary} onClick={() => add("trunk")}>
              + Main run
            </button>
          </div>
        </div>

        {current ? (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${STATUS_TEXT[status][1]}`}>{STATUS_TEXT[status][0]}</span>
              <button
                type="button"
                className={btn.danger}
                onClick={() => {
                  setList(list.filter((c) => c.id !== current.id).map((c) => ({ ...c, power_from: c.power_from === current.id ? null : c.power_from, ground_from: c.ground_from === current.id ? null : c.ground_from })));
                  setSel(list.find((c) => c.id !== current.id)?.id ?? null);
                }}
              >
                Delete {current.kind === "trunk" ? "main run" : "circuit"}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField label="Name" value={current.name} onChange={(e) => patch({ name: e.target.value })} />
              {current.kind === "channel" && (
                <TextField
                  label="Fuse code"
                  value={current.fuse_code ?? ""}
                  onChange={(e) => patch({ fuse_code: e.target.value.trim() || null })}
                  placeholder="e.g. A7"
                  hint="As labelled on the distribution block: block letter + fuse number. Shown on the circuit card."
                />
              )}
              <SelectField label="Product (spec sheet)" value={current.component_key ?? ""} onChange={(e) => patch({ component_key: e.target.value || null })}>
                <option value="">—</option>
                {products.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.title}
                  </option>
                ))}
              </SelectField>
              {current.kind === "channel" && (
                <>
                  <SelectField label="Power (+) from" value={current.power_from ?? ""} onChange={(e) => patch({ power_from: e.target.value || null })}>
                    <option value="">—</option>
                    {trunks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField label="Ground (−) to" value={current.ground_from ?? ""} onChange={(e) => patch({ ground_from: e.target.value || null })}>
                    <option value="">—</option>
                    {trunks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </SelectField>
                </>
              )}
            </div>
            <ChainEditor
              title="Power (+)"
              hint={current.kind === "trunk" ? "From Battery + to the distribution block: parts, fuses and the cables between them." : "From the distribution block: the fuse, the power cable, the device, then e.g. its capacitor."}
              items={current.power}
              onChange={(power) => patch({ power })}
              fuses
            />
            <ChainEditor
              title="Ground (−)"
              hint={current.kind === "trunk" ? "From Battery − to the ground block." : "From the ground block to the device."}
              items={current.ground}
              onChange={(ground) => patch({ ground })}
              fuses={false}
            />
            {current.kind === "channel" && <CablesEditor items={current.cables} onChange={(cables) => patch({ cables })} products={products} />}

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-bold">Boxes on the cable diagram</span>
                <SegmentedTabs
                  options={[
                    { key: "edit", label: "Mark boxes" },
                    { key: "preview", label: "Preview" },
                  ]}
                  value={mode}
                  onChange={setMode}
                  label="Cable diagram mode"
                  tone="light"
                />
              </div>
              {!url ? (
                <p className="m-0 text-sm text-[#55535c]">Upload the cable diagram image above first.</p>
              ) : mode === "edit" ? (
                <BoxMarker url={url} circuits={list} selected={current} onChange={(wiring_hotspots) => patch({ wiring_hotspots })} />
              ) : (
                <div className="rounded-xl bg-prussian p-3 sm:p-5">
                  <CableDiagram imageUrl={url} alt="Cable diagram" circuits={list} components={content.components} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="m-0">Add a main run first, then a circuit per device.</p>
        )}
      </div>
    </Card>
  );
}
