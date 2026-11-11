"use client";

import { useState } from "react";
import { Card, PageTitle, SelectField, TextField, btn } from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { UploadZone } from "@/components/editor/UploadZone";
import { CraftCloseups } from "@/components/editor/sections/CraftCloseups";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { photoSchema } from "@/lib/editor/schemas";
import { CRITERIA } from "@/lib/emma/criteria";
import type { CriterionKey } from "@/lib/emma/matrix";
import { PHOTO_AREAS, type Photo, type PhotoArea } from "@/lib/types";

const codeFor = (area: PhotoArea, i: number) => `${PHOTO_AREAS.find((a) => a.key === area)!.code}-${String(i + 1).padStart(2, "0")}`;

export default function PhotosPage() {
  const { content, update } = useEditor();
  const [area, setArea] = useState<PhotoArea>("engine");
  const [drag, setDrag] = useState<number | null>(null);
  const list = content.photos.filter((p) => p.area === area).sort((a, b) => a.sort - b.sort);

  /** Replace this area's photos, renumbering sort and codes. */
  const setArea_ = (next: Photo[]) =>
    update((c) => ({
      ...c,
      photos: [...c.photos.filter((p) => p.area !== area), ...next.map((p, i) => ({ ...p, sort: i, code: codeFor(area, i) }))],
    }));
  const patch = (id: string, p: Partial<Photo>) => setArea_(list.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const next = [...list];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setArea_(next);
  };

  const options = PHOTO_AREAS.map((a) => ({ key: a.key, label: a.label, count: content.photos.filter((p) => p.area === a.key).length }));

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Photo Log">Photos behind the panels. Each one gets a code and the judge criterion it proves. Drag cards or use the arrows to reorder.</PageTitle>
      <SegmentedTabs options={options} value={area} onChange={setArea} label="Area" tone="light" mode="tabs" idPrefix="ed-area" />
      <div id="ed-area-panel" role="tabpanel" aria-labelledby={`ed-area-tab-${area}`}>
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 xl:grid-cols-2">
          {list.map((p, i) => {
            const check = photoSchema.safeParse(p);
            const errs = check.success ? {} : Object.fromEntries(check.error.issues.map((x) => [x.path[0], x.message]));
            return (
              <li
                key={p.id}
                draggable
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (drag !== null) move(drag, i);
                  setDrag(null);
                }}
                className={`rounded-2xl ${drag === i ? "opacity-50" : ""}`}
              >
                <Card
                  title={p.code}
                  actions={
                    <div className="flex gap-1.5">
                      <span aria-hidden="true" className="flex h-11 cursor-grab items-center px-2 text-[#8a8794]" title="Drag to reorder">
                        ⠿
                      </span>
                      <button type="button" className={btn.ghost} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${p.code} up`}>
                        ↑
                      </button>
                      <button type="button" className={btn.ghost} disabled={i === list.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move ${p.code} down`}>
                        ↓
                      </button>
                      <button type="button" className={btn.ghost} onClick={() => setArea_(list.filter((x) => x.id !== p.id))} aria-label={`Remove ${p.code}`}>
                        ✕
                      </button>
                    </div>
                  }
                >
                  <UploadZone label="Photo" kind="photo" folder={`photo-log/${area}`} value={p.path} onChange={(path) => patch(p.id, { path })} />
                  <TextField label="Caption" value={p.caption} onChange={(e) => patch(p.id, { caption: e.target.value })} error={errs.caption} />
                  <SelectField
                    label="Proves"
                    value={p.proves_criterion ?? ""}
                    onChange={(e) => patch(p.id, { proves_criterion: (e.target.value || null) as CriterionKey | null })}
                  >
                    <option value="">— none —</option>
                    {CRITERIA.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </SelectField>
                </Card>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          className={`${btn.secondary} mt-4`}
          onClick={() =>
            setArea_([...list, { id: crypto.randomUUID(), area, code: "", caption: "", proves_criterion: null, path: null, sort: list.length }])
          }
        >
          + Add slot
        </button>
      </div>
      <CraftCloseups />
    </div>
  );
}
