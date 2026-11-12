"use client";

import { Card, PageTitle, TextField, btn } from "@/components/editor/Field";
import { RowActions } from "@/components/editor/RowActions";
import { MediaListEditor } from "@/components/editor/sections/MediaListEditor";
import { moveItem, newId, useList } from "@/components/editor/useList";
import { ScaledPreview } from "@/components/editor/ScaledPreview";
import { ZoneCards, zoneMedia } from "@/components/public/ZoneCards";
import { fieldErrors, zoneSchema } from "@/lib/editor/schemas";
import {
  MotifsEditor,
  TwoSidesEditor,
} from "@/components/editor/sections/ThemeExtrasEditor";

const MAX_ELEMENTS = 8;

export default function ThemeEditorPage() {
  const zones = useList("zones");

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Theme">
        The two sides, the motifs and their meaning, and the theme in every
        zone. The side names and descriptions are edited in Vehicle &amp; Story.
      </PageTitle>

      <TwoSidesEditor />
      <MotifsEditor />

      <Card title="The theme in every zone" id="zones">
        <p className="m-0 text-sm text-[#4a4852]">
          Judges deduct 1 point for every element that does not follow the
          design idea. List what carries the theme in each zone.
        </p>
        <div className="flex flex-col gap-5">
          {[...zones.items].sort((a, b) => a.sort - b.sort).map((z, zi, sorted) => {
            const e = fieldErrors(zoneSchema, z);
            const setElements = (fn: (els: string[]) => string[]) =>
              zones.patch(z.id, { elements: fn(z.elements) });
            return (
              <fieldset
                key={z.id}
                className="m-0 grid grid-cols-1 gap-4 rounded-xl border border-editor-border p-4 lg:grid-cols-[1fr_1.4fr]"
              >
                <legend className="flex flex-wrap items-center gap-3 px-1 text-sm font-bold">
                  <span>
                    {z.name || "New zone"}
                    {z.criterion && (
                      <span className="font-normal text-[#55535c]">
                        {" "}· judge criterion: {z.criterion}
                      </span>
                    )}
                  </span>
                  <RowActions
                    index={zi}
                    count={sorted.length}
                    label={`zone ${z.name || zi + 1}`}
                    onMove={(to) => zones.setItems(() => moveItem(sorted, zi, to))}
                    onRemove={() => {
                      if (window.confirm(`Remove the zone "${z.name || "New zone"}" with its photos and elements?`)) zones.remove(z.id);
                    }}
                  />
                </legend>
                <div className="flex flex-col gap-4">
                  <TextField
                    label="Zone name"
                    value={z.name}
                    onChange={(ev) =>
                      zones.patch(z.id, { name: ev.target.value })
                    }
                    error={e.name}
                  />
                  <MediaListEditor
                    label="Photos and videos"
                    intro="Shown as a slider at the top of the zone card: visitors swipe or use the arrows. Videos start muted. Set the crop focus so the card shows the right part. The caption is optional."
                    folder="theme"
                    numbered={false}
                    value={zoneMedia(z).filter((m) => m.path || m.url)}
                    onChange={(list) =>
                      zones.patch(z.id, {
                        media: list,
                        photo_path: list.find((m) => m.kind === "photo" && m.path)?.path ?? null,
                      })
                    }
                  />
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
                          onChange={(ev) =>
                            setElements((els) =>
                              els.map((x, j) =>
                                j === i ? ev.target.value : x,
                              ),
                            )
                          }
                        />
                        <div className="pt-7">
                          <RowActions
                            index={i}
                            count={z.elements.length}
                            label={`element ${i + 1} of ${z.name}`}
                            onRemove={() =>
                              setElements((els) =>
                                els.filter((_, j) => j !== i),
                              )
                            }
                          />
                        </div>
                      </li>
                    ))}
                  </ol>
                  {e.elements && (
                    <span className="text-[13px] text-red-700">
                      {e.elements}
                    </span>
                  )}
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
        <button
          type="button"
          className={`${btn.secondary} self-start`}
          onClick={() =>
            zones.setItems((xs) => {
              const id = newId();
              return [
                ...xs,
                {
                  id,
                  sort: Math.max(0, ...xs.map((x) => x.sort)) + 1,
                  key: `zone-${id.slice(0, 8)}`,
                  name: "New zone",
                  criterion: "",
                  photo_path: null,
                  media: [],
                  elements: [],
                },
              ];
            })
          }
        >
          + Add zone
        </button>
        <ScaledPreview label="Preview of the theme zones">
          <div className="pt-10">
            <ZoneCards
              zones={[...zones.items].sort((a, b) => a.sort - b.sort)}
            />
          </div>
        </ScaledPreview>
      </Card>
    </div>
  );
}
