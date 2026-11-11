"use client";

/* eslint-disable @next/next/no-img-element -- the drawing overlay must match the image box exactly */
import { useId, useRef, useState } from "react";
import { isPlaceholder } from "@/lib/format";
import { normalizeHotspots, spotFromDrag, type Hotspot } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";
import type { AudioComponent } from "@/lib/types";
import { useEditor } from "../EditorProvider";
import { SelectField, btn } from "../Field";

type Pt = { x: number; y: number };

/**
 * Mark where each component sits on the uploaded system diagram: choose a
 * component, then drag a box over it. Visitors can then click that device.
 */
export function HotspotEditor({ imagePath }: { imagePath: string }) {
  const uid = useId();
  const { content, update } = useEditor();
  const comps = [...content.components].sort((a, b) => a.sort - b.sort);
  const [selId, setSelId] = useState<string>(comps[0]?.id ?? "");
  const [draft, setDraft] = useState<{ a: Pt; b: Pt } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const url = storageUrl(imagePath);
  const sel = comps.find((c) => c.id === selId) ?? null;
  const selSpots = sel ? normalizeHotspots(sel.hotspots) : [];

  const setSpots = (id: string, spots: Hotspot[]) =>
    update((c) => ({ ...c, components: c.components.map((x) => (x.id === id ? { ...x, hotspots: normalizeHotspots(spots) } : x)) }));

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
  const missing = comps.filter((c) => normalizeHotspots(c.hotspots).length === 0);

  if (!url) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-editor-border bg-[#FAF9F5] p-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">Clickable devices</span>
        <span className="text-sm text-[#4a4852]">
          Choose a component, then drag a box over that device on the diagram. Add more boxes for the same component if it appears more than once.
          Visitors click a box to open the component’s spec sheet.
        </span>
      </div>

      <SelectField label="Component" value={selId} onChange={(e) => setSelId(e.target.value)} className="max-w-[460px]">
        {comps.map((c) => (
          <option key={c.id} value={c.id}>
            {label(c)} ({normalizeHotspots(c.hotspots).length})
          </option>
        ))}
      </SelectField>

      <div
        ref={boxRef}
        role="application"
        aria-label={`Diagram. Drag to add an area for ${sel?.title ?? "the selected component"}.`}
        aria-describedby={`${uid}-list`}
        className="relative cursor-crosshair touch-none select-none overflow-hidden rounded-lg border border-editor-border"
        onPointerDown={(e) => {
          const p = toPct(e);
          if (!p || !sel) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setDraft({ a: p, b: p });
        }}
        onPointerMove={(e) => {
          if (!draft) return;
          const p = toPct(e);
          if (p) setDraft({ ...draft, b: p });
        }}
        onPointerUp={() => {
          if (draftSpot && sel) setSpots(sel.id, [...selSpots, draftSpot]);
          setDraft(null);
        }}
      >
        <img src={url} alt="" draggable={false} className="block h-auto w-full" />
        {comps.flatMap((c) =>
          normalizeHotspots(c.hotspots).map((s, i) => {
            const mine = c.id === selId;
            return (
              <div
                key={`${c.id}-${i}`}
                title={c.title}
                onPointerDown={(e) => {
                  if (mine) return;
                  e.stopPropagation();
                  setSelId(c.id);
                }}
                className={`absolute rounded-md ${mine ? "border-2 border-amber bg-amber/25" : "cursor-pointer border border-dashed border-white/80 bg-white/10 hover:bg-white/25"}`}
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
              >
                <span
                  className={`pointer-events-none absolute left-0 top-0 max-w-[160px] -translate-y-full truncate rounded px-1 text-[10px] font-semibold ${
                    mine ? "bg-amber text-prussian" : "bg-black/70 text-white"
                  }`}
                >
                  {mine ? `${i + 1}` : c.title}
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
      </div>

      {sel && (
        <div id={`${uid}-list`} className="flex flex-col gap-2">
          <span className="text-sm font-semibold">
            Areas for {sel.title}: {selSpots.length}
          </span>
          {selSpots.length === 0 && <span className="text-sm text-[#55535c]">No areas yet. Drag on the diagram to add one.</span>}
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {selSpots.map((s, i) => (
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
                      onChange={(e) => setSpots(sel.id, selSpots.map((x, j) => (j === i ? { ...x, [k]: Number(e.target.value) } : x)))}
                      className="min-h-11 w-24 rounded-xl border border-editor-border bg-white px-3 text-[15px]"
                    />
                  </label>
                ))}
                <button type="button" className={btn.ghost} onClick={() => setSpots(sel.id, selSpots.filter((_, j) => j !== i))} aria-label={`Remove area ${i + 1} of ${sel.title}`}>
                  ✕
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {missing.length > 0 && (
        <p className="m-0 text-[13px] text-[#55535c]">
          Not on the diagram yet: {missing.map((c) => c.title).join(", ")}.
        </p>
      )}
    </div>
  );
}
