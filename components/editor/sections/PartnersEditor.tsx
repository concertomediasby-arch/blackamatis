"use client";

import { fieldErrors, partnerSchema } from "@/lib/editor/schemas";
import { Card, TextField, btn } from "../Field";
import { RowActions } from "../RowActions";
import { UploadZone } from "../UploadZone";
import { moveItem, newId, useList } from "../useList";
import { PartnerLogo } from "@/components/public/PartnerLogo";
import type { HeroLayout } from "@/lib/photo";
import { LayoutSliders } from "../LayoutSliders";
import type { Partner } from "@/lib/types";

/** Partner / sponsor logos shown under "Supported by" on the home page. */
export function PartnersEditor() {
  const partners = useList("partners");
  const sorted = [...partners.items].sort((a, b) => a.sort - b.sort);
  const withLogo = sorted.filter((p) => p.logo_path).length;
  const add = () =>
    partners.setItems((xs) => [
      ...xs,
      {
        id: newId(),
        name: "",
        logo_path: null,
        url: null,
        sort: Math.max(0, ...xs.map((x) => x.sort)) + 1,
      },
    ]);
  return (
    <Card
      title="Supported by · partners"
      id="partners"
      actions={
        <button type="button" className={btn.secondary} onClick={add}>
          + Add partner
        </button>
      }
    >
      <p className="m-0 text-sm text-[#4a4852]">
        Logos under “Supported by” on the home page, as many as you need. Use a
        transparent PNG; the link is optional. A partner without a logo is
        hidden on the site until you upload one.{" "}
        <strong>
          {withLogo} logo{withLogo === 1 ? "" : "s"} on the site.
        </strong>
      </p>
      <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2">
        {sorted.map((p, i) => {
          const e = fieldErrors(partnerSchema, p);
          return (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-editor-border p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">
                  {p.name || `Partner ${i + 1}`}
                  {!p.logo_path && (
                    <span className="ml-2 rounded-full bg-[#F4F2EC] px-2 py-0.5 font-mono text-[11px] font-normal text-[#4a4852]">
                      Hidden until a logo is uploaded
                    </span>
                  )}
                </span>
                <RowActions
                  index={i}
                  count={sorted.length}
                  label={p.name || `partner ${i + 1}`}
                  onMove={(to) =>
                    partners.setItems(() => moveItem(sorted, i, to))
                  }
                  onRemove={() => partners.remove(p.id)}
                />
              </div>
              <TextField
                label="Name"
                value={p.name}
                onChange={(ev) =>
                  partners.patch(p.id, { name: ev.target.value })
                }
                error={e.name}
              />
              <TextField
                label="Website (optional)"
                type="url"
                placeholder="https://"
                value={p.url ?? ""}
                onChange={(ev) =>
                  partners.patch(p.id, { url: ev.target.value || null })
                }
                error={e.url}
              />
              <UploadZone
                label="Logo"
                kind="photo"
                focusable={false}
                folder="partners"
                value={p.logo_path}
                onChange={(path) => partners.patch(p.id, { logo_path: path })}
              />
              {p.logo_path && (
                <LogoPosition
                  partner={p}
                  onChange={(logo_layout) =>
                    partners.patch(p.id, { logo_layout })
                  }
                />
              )}
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={add}
            className="flex h-full min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-editor-border bg-white/60 p-4 text-sm font-semibold text-[#4a4852] hover:border-prussian hover:text-prussian"
          >
            <span aria-hidden="true" className="text-3xl leading-none">
              +
            </span>
            Add partner
          </button>
        </li>
      </ol>
    </Card>
  );
}

/** Size and position of one logo in its box, with the box as it looks on the site. */
function LogoPosition({
  partner,
  onChange,
}: {
  partner: Partner;
  onChange: (l: HeroLayout) => void;
}) {
  return (
    <LayoutSliders
      value={partner.logo_layout}
      onChange={onChange}
      preview={(l) => (
        <div className="rounded-xl bg-prussian p-3 text-ink">
          <div className="mx-auto max-w-[300px]">
            <PartnerLogo partner={{ ...partner, logo_layout: l }} />
          </div>
        </div>
      )}
    />
  );
}
