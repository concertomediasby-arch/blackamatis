"use client";

import { useState } from "react";
import { CRAFT_CHECKLIST } from "@/lib/data/craft";
import { craftSchema, fieldErrors } from "@/lib/editor/schemas";
import { CRAFT_CATEGORIES, type CraftCategory } from "@/lib/types";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { Card, TextField, btn } from "../Field";
import { RowActions } from "../RowActions";
import { UploadZone } from "../UploadZone";
import { moveItem, newId, useList } from "../useList";

const PER_CATEGORY = 3;

/** Close-up photos per craftsmanship category (3 are shown on the Installation page). */
export function CraftCloseups() {
  const craft = useList("craft");
  const [cat, setCat] = useState<CraftCategory>("wiring");
  const list = craft.items.filter((p) => p.category === cat).sort((a, b) => a.sort - b.sort);
  const setCategory = (next: typeof list) => craft.setItems((xs) => [...xs.filter((p) => p.category !== cat), ...next]);
  const options = CRAFT_CATEGORIES.map((c) => ({ ...c, count: craft.items.filter((p) => p.category === c.key).length }));

  return (
    <Card title="Craftsmanship close-ups" id="craft">
      <p className="m-0 text-sm text-[#4a4852]">
        {PER_CATEGORY} close-ups per category for judges (M: 2 pts · X: 10 pts per category). What judges look at:{" "}
        {CRAFT_CHECKLIST[cat].join(" · ").toLowerCase()}.
      </p>
      <SegmentedTabs options={options} value={cat} onChange={setCat} label="Craftsmanship category" tone="light" mode="tabs" idPrefix="ed-craft" />
      <div id="ed-craft-panel" role="tabpanel" aria-labelledby={`ed-craft-tab-${cat}`} className="flex flex-col gap-4">
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-3">
          {list.map((p, i) => {
            const e = fieldErrors(craftSchema, p);
            return (
              <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-editor-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">Close-up {i + 1}</span>
                  <RowActions
                    index={i}
                    count={list.length}
                    label={`close-up ${i + 1}`}
                    onMove={(to) => setCategory(moveItem(list, i, to))}
                    onRemove={() => craft.remove(p.id)}
                  />
                </div>
                <UploadZone label="Photo" kind="photo" folder={`craft/${cat}`} value={p.path} onChange={(path) => craft.patch(p.id, { path })} />
                <TextField label="Caption" value={p.caption} onChange={(ev) => craft.patch(p.id, { caption: ev.target.value })} error={e.caption} />
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          className={`${btn.secondary} self-start`}
          disabled={list.length >= PER_CATEGORY}
          onClick={() => setCategory([...list, { id: newId(), category: cat, caption: "", path: null, sort: list.length + 1 }])}
        >
          + Add close-up
        </button>
      </div>
    </Card>
  );
}
