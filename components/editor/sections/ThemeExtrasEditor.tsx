"use client";

/* eslint-disable @next/next/no-img-element -- the click overlay must match the image box exactly */
import { useState } from "react";
import { motifPhotos, normalizeMotifs, normalizePoints } from "@/lib/theme";
import { storageUrl } from "@/lib/supabase/env";
import type { Motif, Vehicle } from "@/lib/types";
import { MotifMap } from "@/components/public/MotifMap";
import { ThemeSides } from "@/components/public/ThemeSides";
import { themeLayoutOf } from "@/lib/page-layout";
import { useEditor } from "../EditorProvider";
import { ScaledPreview } from "../ScaledPreview";
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
      <ScaledPreview label="Preview of the two side cards">
        <div className="pb-8">
          <ThemeSides v={v} layout={themeLayoutOf(v)} />
        </div>
      </ScaledPreview>
    </Card>
  );
}

/**
 * Editor › Theme › Motifs: one or more photos (e.g. both sides of the car), the
 * motifs with their meaning, and a click on the photo shown places the selected
 * motif's point on that photo.
 */
export function MotifsEditor() {
  const { v, set } = useVehicle();
  const motifs = normalizeMotifs(v.motifs);
  const photos = motifPhotos(v);
  const [sel, setSel] = useState<string | null>(motifs[0]?.id ?? null);
  const [shown, setShown] = useState(0);
  const cur = Math.min(shown, Math.max(0, photos.length - 1));
  const url = storageUrl(photos[cur] ?? null);
  const save = (next: Motif[]) => set({ motifs: next });
  const savePhotos = (next: string[]) =>
    set({ motif_photos: next, motif_photo_path: next[0] ?? null });
  const removePhoto = (i: number) => {
    const onIt = motifs.filter((m) => (m.photo ?? 0) === i).length;
    if (onIt && !window.confirm(`${onIt} motif(s) sit on this photo. They move to the first photo; place them again there.`)) return;
    savePhotos(photos.filter((_, j) => j !== i));
    save(motifs.map((m) => ((m.photo ?? 0) === i ? { ...m, photo: 0 } : (m.photo ?? 0) > i ? { ...m, photo: (m.photo ?? 0) - 1 } : m)));
    setShown(0);
  };
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
        click a number to read it. The section stays hidden on the site until at
        least one motif has a name or a meaning.
      </p>
      <div className="flex flex-col gap-3">
        {[...photos, null].map((p, i) =>
          p === null && i > 0 && photos.length > 0 ? null : (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <UploadZone
                  label={`Motif photo ${i + 1}`}
                  kind="photo"
                  folder="theme"
                  value={p}
                  onChange={(path) =>
                    path
                      ? savePhotos(i < photos.length ? photos.map((x, j) => (j === i ? path : x)) : [...photos, path])
                      : removePhoto(i)
                  }
                  hint="A clear side or three-quarter photo where the motifs are visible."
                />
              </div>
              {p && photos.length > 1 && (
                <button type="button" className={`${btn.ghost} mt-7`} onClick={() => removePhoto(i)} aria-label={`Remove motif photo ${i + 1}`}>
                  ✕
                </button>
              )}
            </div>
          ),
        )}
        {photos.length > 0 && (
          <AddPhoto onAdd={(path) => savePhotos([...photos, path])} n={photos.length + 1} />
        )}
      </div>
      {photos.length > 1 && (
        <div role="group" aria-label="Photo to place motifs on" className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Placing on:</span>
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === cur}
              onClick={() => setShown(i)}
              className={`${btn.secondary} min-h-9 ${i === cur ? "!bg-prussian !text-lemon" : ""}`}
            >
              Photo {i + 1}
            </button>
          ))}
        </div>
      )}
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
                  photo: cur,
                });
              }}
            >
              <img
                src={url}
                alt=""
                draggable={false}
                className="block h-auto w-full rounded-lg"
              />
              {motifs.map((m, i) => (m.photo ?? 0) !== cur ? null : (
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
                    onClick={() => {
                      setSel(m.id);
                      if ((m.photo ?? 0) < photos.length) setShown(m.photo ?? 0);
                    }}
                  >
                    {m.id === sel
                      ? `Placing ${i + 1} — click the photo`
                      : `Place ${i + 1} on the photo`}
                    {photos.length > 1 && ` · photo ${Math.min(m.photo ?? 0, photos.length - 1) + 1}`}
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
                photo: cur,
              };
              save([...motifs, m]);
              setSel(m.id);
            }}
          >
            + Add motif
          </button>
        </div>
      </div>
      <ScaledPreview
        label="Preview of the motifs as visitors see them"
        width={1280}
      >
        <div className="p-10">
          <MotifMap photos={motifPhotos(v)} motifs={motifs} />
        </div>
      </ScaledPreview>
    </Card>
  );
}

/** "+ Add motif photo": an empty upload box; the photo joins the list once uploaded. */
function AddPhoto({ onAdd, n }: { onAdd: (path: string) => void; n: number }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" className={`${btn.secondary} self-start`} onClick={() => setOpen(true)}>
        + Add motif photo
      </button>
    );
  return (
    <UploadZone
      label={`Motif photo ${n}`}
      kind="photo"
      folder="theme"
      value={null}
      onChange={(path) => {
        if (path) onAdd(path);
        setOpen(false);
      }}
      hint="For example the other side of the car."
    />
  );
}
