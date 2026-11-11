"use client";

import { fieldErrors, partnerSchema } from "@/lib/editor/schemas";
import { Card, TextField, btn } from "../Field";
import { RowActions } from "../RowActions";
import { UploadZone } from "../UploadZone";
import { moveItem, newId, useList } from "../useList";
import { PartnerLogo } from "@/components/public/PartnerLogo";
import {
  DEFAULT_HERO_LAYOUT,
  LAYOUT_LIMITS,
  normalizeLayout,
  type HeroLayout,
} from "@/lib/photo";
import type { Partner } from "@/lib/types";

/** Partner / sponsor logos shown under "Supported by" on the home page. */
export function PartnersEditor() {
  const partners = useList("partners");
  const sorted = [...partners.items].sort((a, b) => a.sort - b.sort);
  return (
    <Card
      title="Partners"
      id="partners"
      actions={
        <button
          type="button"
          className={btn.secondary}
          onClick={() =>
            partners.setItems((xs) => [
              ...xs,
              {
                id: newId(),
                name: "",
                logo_path: null,
                url: null,
                sort: xs.length + 1,
              },
            ])
          }
        >
          + Add partner
        </button>
      }
    >
      <p className="m-0 text-sm text-[#4a4852]">
        Logos under “Supported by” on the home page. Use a transparent PNG; the
        link is optional.
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
                <span className="text-sm font-bold">Partner {i + 1}</span>
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
  const l = normalizeLayout(partner.logo_layout);
  const set = (k: keyof HeroLayout, v: number) => onChange({ ...l, [k]: v });
  const sliders: {
    k: keyof HeroLayout;
    label: string;
    min: number;
    max: number;
    unit: string;
  }[] = [
    {
      k: "scale",
      label: "Size",
      min: LAYOUT_LIMITS.minScale,
      max: LAYOUT_LIMITS.maxScale,
      unit: "%",
    },
    {
      k: "x",
      label: "Left / right",
      min: -LAYOUT_LIMITS.offset,
      max: LAYOUT_LIMITS.offset,
      unit: "",
    },
    {
      k: "y",
      label: "Up / down",
      min: -LAYOUT_LIMITS.offset,
      max: LAYOUT_LIMITS.offset,
      unit: "",
    },
  ];
  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-xl border border-editor-border p-3">
      <legend className="px-1 text-sm font-semibold">
        Position &amp; size
      </legend>
      <div className="rounded-xl bg-prussian p-3 text-ink">
        <div className="mx-auto max-w-[300px]">
          <PartnerLogo partner={{ ...partner, logo_layout: l }} />
        </div>
      </div>
      {sliders.map((x) => (
        <label
          key={x.k}
          className="grid grid-cols-[110px_1fr_48px] items-center gap-3 text-[13px] font-semibold"
        >
          {x.label}
          <input
            type="range"
            min={x.min}
            max={x.max}
            value={l[x.k]}
            onChange={(e) => set(x.k, Number(e.target.value))}
            className="accent-prussian"
          />
          <span className="text-right font-mono text-[12px]">
            {l[x.k]}
            {x.unit}
          </span>
        </label>
      ))}
      <button
        type="button"
        className={`${btn.secondary} self-start`}
        onClick={() => onChange(DEFAULT_HERO_LAYOUT)}
      >
        Reset
      </button>
    </fieldset>
  );
}
