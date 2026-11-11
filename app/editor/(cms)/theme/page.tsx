"use client";

import { Card, PageTitle, TextField, btn } from "@/components/editor/Field";
import { RowActions } from "@/components/editor/RowActions";
import { UploadZone } from "@/components/editor/UploadZone";
import { moveItem, newId, useList } from "@/components/editor/useList";
import { fieldErrors, moodSchema, zoneSchema } from "@/lib/editor/schemas";

const MAX_ELEMENTS = 8;
const MAX_MOOD = 8;

export default function ThemeEditorPage() {
  const zones = useList("zones");
  const mood = useList("moodboard");
  const moodSorted = [...mood.items].sort((a, b) => a.sort - b.sort);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Theme">
        How the two-face theme shows in every zone, and the sketches behind it. The dark and light side texts are edited in Vehicle &amp; Story.
      </PageTitle>

      <Card title="The theme in every zone" id="zones">
        <p className="m-0 text-sm text-[#4a4852]">Judges deduct 1 point for every element that does not follow the design idea. List what carries the theme in each zone.</p>
        <div className="flex flex-col gap-5">
          {zones.items.map((z) => {
            const e = fieldErrors(zoneSchema, z);
            const setElements = (fn: (els: string[]) => string[]) => zones.patch(z.id, { elements: fn(z.elements) });
            return (
              <fieldset key={z.id} className="m-0 grid grid-cols-1 gap-4 rounded-xl border border-editor-border p-4 lg:grid-cols-[1fr_1.4fr]">
                <legend className="px-1 text-sm font-bold">
                  {z.name} <span className="font-normal text-[#55535c]">· judge criterion: {z.criterion}</span>
                </legend>
                <div className="flex flex-col gap-4">
                  <TextField label="Zone name" value={z.name} onChange={(ev) => zones.patch(z.id, { name: ev.target.value })} error={e.name} />
                  <UploadZone label="Zone photo" kind="photo" folder="theme" value={z.photo_path} onChange={(p) => zones.patch(z.id, { photo_path: p })} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Theme elements</span>
                  <ol className="m-0 flex list-none flex-col gap-2 p-0">
                    {z.elements.map((el, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <TextField
                          className="flex-1"
                          label={`Element ${i + 1}`}
                          value={el}
                          onChange={(ev) => setElements((els) => els.map((x, j) => (j === i ? ev.target.value : x)))}
                        />
                        <div className="pt-7">
                          <RowActions index={i} count={z.elements.length} label={`element ${i + 1} of ${z.name}`} onRemove={() => setElements((els) => els.filter((_, j) => j !== i))} />
                        </div>
                      </li>
                    ))}
                  </ol>
                  {e.elements && <span className="text-[13px] text-red-700">{e.elements}</span>}
                  <button
                    type="button"
                    className={`${btn.secondary} self-start`}
                    disabled={z.elements.length >= MAX_ELEMENTS}
                    onClick={() => setElements((els) => [...els, ""])}
                  >
                    + Add element
                  </button>
                </div>
              </fieldset>
            );
          })}
        </div>
      </Card>

      <Card
        title="Sketches & moodboard"
        id="moodboard"
        actions={
          <button
            type="button"
            className={btn.secondary}
            disabled={mood.items.length >= MAX_MOOD}
            onClick={() => mood.setItems((xs) => [...xs, { id: newId(), caption: "", path: null, sort: xs.length + 1 }])}
          >
            + Add image
          </button>
        }
      >
        <p className="m-0 text-sm text-[#4a4852]">The first image is shown large on the Theme page. Up to {MAX_MOOD} images.</p>
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2">
          {moodSorted.map((m, i) => {
            const e = fieldErrors(moodSchema, m);
            return (
              <li key={m.id} className="flex flex-col gap-3 rounded-xl border border-editor-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{i === 0 ? "Image 1 · large" : `Image ${i + 1}`}</span>
                  <RowActions
                    index={i}
                    count={moodSorted.length}
                    label={`image ${i + 1}`}
                    onMove={(to) => mood.setItems(() => moveItem(moodSorted, i, to))}
                    onRemove={() => mood.remove(m.id)}
                  />
                </div>
                <UploadZone label="Sketch, reference or render" kind="photo" folder="moodboard" value={m.path} onChange={(p) => mood.patch(m.id, { path: p })} />
                <TextField label="Caption" value={m.caption} onChange={(ev) => mood.patch(m.id, { caption: ev.target.value })} error={e.caption} />
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
