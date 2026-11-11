"use client";

/* eslint-disable @next/next/no-img-element -- the drawing overlay must match the image box exactly */
import { useEffect, useId, useRef, useState } from "react";
import { DiagramHotspots } from "@/components/public/DiagramHotspots";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { newComponent } from "@/lib/editor/components";
import { isPlaceholder } from "@/lib/format";
import { normalizeHotspots, spotFromDrag, type Hotspot } from "@/lib/photo";
import { TYPE_LABELS } from "@/lib/specs";
import { storageUrl } from "@/lib/supabase/env";
import { COMPONENT_TYPES, type AudioComponent, type ComponentType } from "@/lib/types";
import { useEditor } from "../EditorProvider";
import { SelectField, TextField, btn } from "../Field";

type Pt = { x: number; y: number };
type Menu = { compId: string; index: number };
type Mode = "mark" | "preview";

/**
 * Mark where each component sits on the uploaded system diagram.
 * Drag a box over a device, then choose (or create) its component in the menu
 * that opens on the box. "Preview" shows the diagram exactly as visitors get it.
 */
export function HotspotEditor({ imagePath, alt }: { imagePath: string; alt: string }) {
  const uid = useId();
  const { content, update } = useEditor();
  const comps = [...content.components].sort((a, b) => a.sort - b.sort);
  const [mode, setMode] = useState<Mode>("mark");
  const [selId, setSelId] = useState<string>(comps[0]?.id ?? "");
  const [draft, setDraft] = useState<{ a: Pt; b: Pt } | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [creating, setCreating] = useState<{ title: string; type: ComponentType } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const url = storageUrl(imagePath);
  const sel = comps.find((c) => c.id === selId) ?? null;
  const spotsOf = (c: AudioComponent | null | undefined) => (c ? normalizeHotspots(c.hotspots) : []);

  useEffect(() => {
    if (menu) menuRef.current?.querySelector<HTMLElement>("select, input")?.focus();
  }, [menu]);

  const setComponents = (fn: (cs: AudioComponent[]) => AudioComponent[]) => update((c) => ({ ...c, components: fn(c.components) }));
  const setSpots = (id: string, spots: Hotspot[]) =>
    setComponents((cs) => cs.map((x) => (x.id === id ? { ...x, hotspots: normalizeHotspots(spots) } : x)));

  /** Move one area to another component; returns its new position there. */
  const moveSpot = (m: Menu, toId: string): Menu => {
    if (toId === m.compId) return m;
    const from = comps.find((c) => c.id === m.compId);
    const spot = spotsOf(from)[m.index];
    if (!spot) return m;
    const to = comps.find((c) => c.id === toId);
    const newIndex = spotsOf(to).length;
    setComponents((cs) =>
      cs.map((x) =>
        x.id === m.compId ? { ...x, hotspots: spotsOf(x).filter((_, j) => j !== m.index) } : x.id === toId ? { ...x, hotspots: [...spotsOf(x), spot] } : x,
      ),
    );
    setSelId(toId);
    return { compId: toId, index: newIndex };
  };

  const createFor = (m: Menu, title: string, type: ComponentType) => {
    const from = comps.find((c) => c.id === m.compId);
    const spot = spotsOf(from)[m.index];
    if (!spot) return;
    const c = newComponent({ title, type, existing: comps, hotspots: [spot] });
    setComponents((cs) => [...cs.map((x) => (x.id === m.compId ? { ...x, hotspots: spotsOf(x).filter((_, j) => j !== m.index) } : x)), c]);
    setSelId(c.id);
    setMenu({ compId: c.id, index: 0 });
    setCreating(null);
  };

  const toPct = (e: React.PointerEvent): Pt | null => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return null;
    return { x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) };
  };

  const label = (c: AudioComponent) => {
    const bm = [c.brand, c.model].filter((x) => !isPlaceholder(x)).join(" ");
    return bm ? `${c.title} — ${bm}` : c.title;
  };
  const draftSpot = draft ? spotFromDrag(draft.a, draft.b) : null;
  const missing = comps.filter((c) => spotsOf(c).length === 0);
  const menuComp = menu ? comps.find((c) => c.id === menu.compId) : undefined;
  const menuSpot = menu ? spotsOf(menuComp)[menu.index] : undefined;

  if (!url) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-editor-border bg-[#FAF9F5] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-[640px] flex-col gap-1">
          <span className="text-sm font-bold">Clickable devices</span>
          <span className="text-sm text-[#4a4852]">
            Drag a box over a device on the diagram, then choose its component in the menu that opens (or create a new one). Click a box to change or
            remove it. Use <b>Preview</b> to try it exactly as visitors will.
          </span>
        </div>
        <SegmentedTabs
          options={[
            { key: "mark", label: "Mark devices" },
            { key: "preview", label: "Preview" },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setMenu(null);
          }}
          label="Diagram mode"
          tone="light"
        />
      </div>

      {mode === "preview" ? (
        <div className="rounded-xl bg-prussian p-3 sm:p-5">
          <DiagramHotspots imageUrl={url} alt={alt || "System diagram"} components={comps} />
          <p className="m-0 mt-3 text-[13px] text-muted">Preview with your current draft. Click a device to open its spec sheet.</p>
        </div>
      ) : (
        <>
          <SelectField label="New boxes go to" value={selId} onChange={(e) => setSelId(e.target.value)} className="max-w-[460px]" hint="You can change it per box afterwards.">
            {comps.map((c) => (
              <option key={c.id} value={c.id}>
                {label(c)} ({spotsOf(c).length})
              </option>
            ))}
          </SelectField>

          {/* Dark backdrop like the public page, so transparent diagrams stay readable. */}
          <div className="rounded-xl bg-prussian p-3 sm:p-5">
          <div
            ref={boxRef}
            role="application"
            aria-label="Diagram. Drag to add a box over a device; click a box to change it."
            aria-describedby={`${uid}-list`}
            className="relative cursor-crosshair touch-none select-none"
            onPointerDown={(e) => {
              const p = toPct(e);
              if (!p || !sel) return;
              setMenu(null);
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              setDraft({ a: p, b: p });
            }}
            onPointerMove={(e) => {
              if (!draft) return;
              const p = toPct(e);
              if (p) setDraft({ ...draft, b: p });
            }}
            onPointerUp={() => {
              if (draftSpot && sel) {
                const index = spotsOf(sel).length;
                setSpots(sel.id, [...spotsOf(sel), draftSpot]);
                setMenu({ compId: sel.id, index });
                setCreating(null);
              }
              setDraft(null);
            }}
          >
            <img src={url} alt="" draggable={false} className="block h-auto w-full rounded-lg" />
            {comps.flatMap((c) =>
              spotsOf(c).map((s, i) => {
                const mine = c.id === selId;
                const open = menu?.compId === c.id && menu.index === i;
                return (
                  <div
                    key={`${c.id}-${i}`}
                    title={c.title}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelId(c.id);
                      setMenu({ compId: c.id, index: i });
                      setCreating(null);
                    }}
                    className={`absolute cursor-pointer rounded-md ${
                      open ? "border-2 border-prussian bg-amber/40" : mine ? "border-2 border-amber bg-amber/25" : "border border-dashed border-white/80 bg-white/10 hover:bg-white/25"
                    }`}
                    style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
                  >
                    <span
                      className={`pointer-events-none absolute left-0 top-0 max-w-[180px] -translate-y-full truncate rounded px-1 text-[10px] font-semibold ${
                        mine || open ? "bg-amber text-prussian" : "bg-black/70 text-white"
                      }`}
                    >
                      {c.title}
                    </span>
                  </div>
                );
              }),
            )}
            {draftSpot && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute rounded-md border-2 border-dashed border-amber bg-amber/20"
                style={{ left: `${draftSpot.x}%`, top: `${draftSpot.y}%`, width: `${draftSpot.w}%`, height: `${draftSpot.h}%` }}
              />
            )}

            {menu && menuComp && menuSpot && (
              <div
                ref={menuRef}
                role="dialog"
                aria-label="Choose the device for this box"
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setMenu(null);
                }}
                className="absolute z-20 flex w-[300px] cursor-default flex-col gap-3 rounded-xl border border-editor-border bg-white p-4 text-[#14141a] shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
                style={{
                  left: `min(${menuSpot.x}%, calc(100% - 300px))`,
                  ...(menuSpot.y + menuSpot.h > 62 ? { bottom: `calc(${100 - menuSpot.y}% + 8px)` } : { top: `calc(${menuSpot.y + menuSpot.h}% + 8px)` }),
                }}
              >
                {creating ? (
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (creating.title.trim()) createFor(menu, creating.title, creating.type);
                    }}
                  >
                    <span className="text-sm font-bold">New component for this box</span>
                    <TextField label="Name" placeholder="e.g. Amplifier STEG" value={creating.title} onChange={(e) => setCreating({ ...creating, title: e.target.value })} />
                    <SelectField label="Type" value={creating.type} onChange={(e) => setCreating({ ...creating, type: e.target.value as ComponentType })}>
                      {COMPONENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABELS[t]}
                        </option>
                      ))}
                    </SelectField>
                    <div className="flex gap-2">
                      <button type="submit" className={btn.primary} disabled={!creating.title.trim()}>
                        Create
                      </button>
                      <button type="button" className={btn.secondary} onClick={() => setCreating(null)}>
                        Back
                      </button>
                    </div>
                    <span className="text-[12px] text-[#55535c]">Fill in brand, model and specs later in the component list below.</span>
                  </form>
                ) : (
                  <>
                    <SelectField label="This box is" value={menu.compId} onChange={(e) => setMenu(moveSpot(menu, e.target.value))}>
                      {comps.map((c) => (
                        <option key={c.id} value={c.id}>
                          {label(c)}
                        </option>
                      ))}
                    </SelectField>
                    <button type="button" className={`${btn.secondary} self-start`} onClick={() => setCreating({ title: "", type: "amplifier" })}>
                      + New component…
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={btn.primary} onClick={() => setMenu(null)}>
                        Done
                      </button>
                      <button
                        type="button"
                        className={btn.danger}
                        onClick={() => {
                          setSpots(menu.compId, spotsOf(menuComp).filter((_, j) => j !== menu.index));
                          setMenu(null);
                        }}
                      >
                        Delete box
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          </div>

          {sel && (
            <div id={`${uid}-list`} className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                Boxes for {sel.title}: {spotsOf(sel).length}
              </span>
              <ol className="m-0 flex list-none flex-col gap-2 p-0">
                {spotsOf(sel).map((s, i) => (
                  <li key={i} className="flex flex-wrap items-end gap-2">
                    <span className="w-6 pb-3 text-sm font-bold">{i + 1}</span>
                    {(["x", "y", "w", "h"] as const).map((k) => (
                      <label key={k} className="flex flex-col gap-1 text-[12px] font-semibold">
                        {{ x: "Left %", y: "Top %", w: "Width %", h: "Height %" }[k]}
                        <input
                          type="number"
                          step={0.5}
                          min={0}
                          max={100}
                          value={s[k]}
                          onChange={(e) => setSpots(sel.id, spotsOf(sel).map((x, j) => (j === i ? { ...x, [k]: Number(e.target.value) } : x)))}
                          className="min-h-11 w-24 rounded-xl border border-editor-border bg-white px-3 text-[15px]"
                        />
                      </label>
                    ))}
                    <button type="button" className={btn.ghost} onClick={() => setSpots(sel.id, spotsOf(sel).filter((_, j) => j !== i))} aria-label={`Remove box ${i + 1} of ${sel.title}`}>
                      ✕
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {missing.length > 0 && <p className="m-0 text-[13px] text-[#55535c]">Not on the diagram yet: {missing.map((c) => c.title).join(", ")}.</p>}
        </>
      )}
    </div>
  );
}
