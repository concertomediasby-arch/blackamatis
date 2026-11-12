"use client";

/* eslint-disable @next/next/no-img-element -- the click overlay must match the image box exactly */
import { useState } from "react";
import { normalizeMotifs, normalizePoints } from "@/lib/theme";
import { storageUrl } from "@/lib/supabase/env";
import type { Motif, Vehicle } from "@/lib/types";
import { useEditor } from "../EditorProvider";
import { Card, TextArea, TextField, btn } from "../Field";
import { UploadZone } from "../UploadZone";

const MAX_POINTS = 5;
const inputCls =
  "min-h-11 w-full rounded-xl border border-editor-border bg-white px-3 text-[15px]";

function useVehicle() {
  const { content, update } = useEditor();
  const set = (patch: Partial<Vehicle>) =>
    update((c) => ({ ...c, vehicle: { ...c.vehicle, ...patch } }));
  return { v: content.vehicle, set };
}

function PointsEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  // Keep empty rows while editing; they are dropped on the public page.
  const rows = value.length ? value : [];
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1 text-sm font-semibold">{label}</legend>
      {rows.map((p, i) => (
        <div key={i} className="flex gap-2">
          <input
            aria-label={`${label} ${i + 1}`}
            className={inputCls}
            maxLength={90}
            value={p}
            placeholder="e.g. Gold line art on black"
            onChange={(e) =>
              onChange(rows.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
          <button
            type="button"
            className={btn.ghost}
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            aria-label={`Remove point ${i + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
      {rows.length < MAX_POINTS && (
        <button
          type="button"
          className={`${btn.secondary} self-start`}
          onClick={() => onChange([...rows, ""])}
        >
          + Add point
        </button>
      )}
    </fieldset>
  );
}

/** Editor › Theme › Two sides: a photo and up to five short points per side. */
export function TwoSidesEditor() {
  const { v, set } = useVehicle();
  const raw = (x: unknown) =>
    Array.isArray(x)
      ? (x as unknown[]).filter((s): s is string => typeof s === "string")
      : [];
  return (
    <Card title="Two sides" id="sides">
      <p className="m-0 text-sm text-[#4a4852]">
        The two cards at the top of the Theme page. Names and descriptions are
        in Vehicle &amp; Story; here, a photo of each side and up to{" "}
        {MAX_POINTS} short points that show its character.{" "}
        {normalizePoints(v.dark_side_points).length +
          normalizePoints(v.light_side_points).length}{" "}
        points filled in.
      </p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-editor-border p-4">
          <span className="text-sm font-bold">
            Dark side · {v.dark_side_name}
          </span>
          <UploadZone
            label="Photo"
            kind="photo"
            folder="theme"
            value={v.dark_side_photo_path ?? null}
            onChange={(p) => set({ dark_side_photo_path: p })}
          />
          <PointsEditor
            label="Points"
            value={raw(v.dark_side_points)}
            onChange={(x) => set({ dark_side_points: x })}
          />
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-editor-border p-4">
          <span className="text-sm font-bold">
            Light side · {v.light_side_name}
          </span>
          <UploadZone
            label="Photo"
            kind="photo"
            folder="theme"
            value={v.light_side_photo_path ?? null}
            onChange={(p) => set({ light_side_photo_path: p })}
          />
          <PointsEditor
            label="Points"
            value={raw(v.light_side_points)}
            onChange={(x) => set({ light_side_points: x })}
          />
        </div>
      </div>
    </Card>
  );
}

/** Editor › Theme › Motifs: one photo, the motifs with their meaning, and a click on the photo places the selected motif's point. */
export function MotifsEditor() {
  const { v, set } = useVehicle();
  const motifs = normalizeMotifs(v.motifs);
  const [sel, setSel] = useState<string | null>(motifs[0]?.id ?? null);
  const url = storageUrl(v.motif_photo_path);
  const save = (next: Motif[]) => set({ motifs: next });
  const patch = (id: string, p: Partial<Motif>) =>
    save(motifs.map((m) => (m.id === id ? { ...m, ...p } : m)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...motifs];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    save(next);
  };

  return (
    <Card title="Motifs" id="motifs">
      <p className="m-0 text-sm text-[#4a4852]">
        A photo of the car and the motifs on it. Add a motif, then click on the
        photo to place its number. Write what it is and what it means; visitors
        click a number to read it. The section stays hidden on the site until
        at least one motif has a name or a meaning.
      </p>
      <UploadZone
        label="Motif photo"
        kind="photo"
        folder="theme"
        value={v.motif_photo_path ?? null}
        onChange={(p) => set({ motif_photo_path: p })}
        hint="A clear side or three-quarter photo where the motifs are visible."
      />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="self-start rounded-xl bg-prussian p-3 xl:sticky xl:top-24">
          {url ? (
            <div
              role="application"
              aria-label="Motif photo. Click to place the selected motif."
              className="relative cursor-crosshair select-none"
              onClick={(e) => {
                if (!sel) return;
                const r = e.currentTarget.getBoundingClientRect();
                patch(sel, {
                  x: Math.round(((e.clientX - r.left) / r.width) * 1000) / 10,
                  y: Math.round(((e.clientY - r.top) / r.height) * 1000) / 10,
                });
              }}
            >
              <img
                src={url}
                alt=""
                draggable={false}
                className="block h-auto w-full rounded-lg"
              />
              {motifs.map((m, i) => (
                <span
                  key={m.id}
                  className={`pointer-events-none absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[12px] font-bold ${
                    m.id === sel
                      ? "border-prussian bg-amber text-prussian"
                      : "border-amber bg-prussian text-amber"
                  }`}
                  style={{ left: `${m.x}%`, top: `${m.y}%` }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          ) : (
            <p className="m-0 p-6 text-center text-sm text-white/70">
              Upload the motif photo first.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {motifs.map((m, i) => (
              <li
                key={m.id}
                className={`flex flex-col gap-3 rounded-xl border p-3 ${m.id === sel ? "border-prussian bg-[#FFFBE0]" : "border-editor-border"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className={`${btn.secondary} min-h-9`}
                    aria-pressed={m.id === sel}
                    onClick={() => setSel(m.id)}
                  >
                    {m.id === sel
                      ? `Placing ${i + 1} — click the photo`
                      : `Place ${i + 1} on the photo`}
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className={btn.ghost}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      aria-label={`Move motif ${i + 1} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={btn.ghost}
                      disabled={i === motifs.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label={`Move motif ${i + 1} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={btn.ghost}
                      onClick={() => save(motifs.filter((x) => x.id !== m.id))}
                      aria-label={`Remove motif ${i + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <TextField
                  label="Motif"
                  maxLength={60}
                  value={m.title}
                  onChange={(e) => patch(m.id, { title: e.target.value })}
                  onFocus={() => setSel(m.id)}
                />
                <TextArea
                  label="Meaning"
                  rows={3}
                  maxLength={500}
                  value={m.meaning}
                  onChange={(e) => patch(m.id, { meaning: e.target.value })}
                  onFocus={() => setSel(m.id)}
                />
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={`${btn.secondary} self-start`}
            onClick={() => {
              const m: Motif = {
                id: crypto.randomUUID(),
                title: "",
                meaning: "",
                x: 50,
                y: 50,
              };
              save([...motifs, m]);
              setSel(m.id);
            }}
          >
            + Add motif
          </button>
        </div>
      </div>
    </Card>
  );
}
