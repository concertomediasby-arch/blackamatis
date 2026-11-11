"use client";

import { fieldErrors, partnerSchema } from "@/lib/editor/schemas";
import { Card, TextField, btn } from "../Field";
import { RowActions } from "../RowActions";
import { UploadZone } from "../UploadZone";
import { moveItem, newId, useList } from "../useList";

/** Partner / sponsor logos shown under "Supported by" on the home page. */
export function PartnersEditor() {
  const partners = useList("partners");
  const sorted = [...partners.items].sort((a, b) => a.sort - b.sort);
  return (
    <Card
      title="Partners"
      id="partners"
      actions={
        <button type="button" className={btn.secondary} onClick={() => partners.setItems((xs) => [...xs, { id: newId(), name: "", logo_path: null, url: null, sort: xs.length + 1 }])}>
          + Add partner
        </button>
      }
    >
      <p className="m-0 text-sm text-[#4a4852]">Logos under “Supported by” on the home page. Use a transparent PNG; the link is optional.</p>
      <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2">
        {sorted.map((p, i) => {
          const e = fieldErrors(partnerSchema, p);
          return (
            <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-editor-border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">Partner {i + 1}</span>
                <RowActions
                  index={i}
                  count={sorted.length}
                  label={p.name || `partner ${i + 1}`}
                  onMove={(to) => partners.setItems(() => moveItem(sorted, i, to))}
                  onRemove={() => partners.remove(p.id)}
                />
              </div>
              <TextField label="Name" value={p.name} onChange={(ev) => partners.patch(p.id, { name: ev.target.value })} error={e.name} />
              <TextField
                label="Website (optional)"
                type="url"
                placeholder="https://"
                value={p.url ?? ""}
                onChange={(ev) => partners.patch(p.id, { url: ev.target.value || null })}
                error={e.url}
              />
              <UploadZone label="Logo" kind="photo" folder="partners" value={p.logo_path} onChange={(path) => partners.patch(p.id, { logo_path: path })} />
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
