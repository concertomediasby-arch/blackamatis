"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, Checkbox, PageTitle, SelectField, TextArea, TextField, btn } from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { UploadZone } from "@/components/editor/UploadZone";
import { DiagramImageCard } from "@/components/editor/sections/DiagramImageCard";
import { componentSchema, type ComponentForm } from "@/lib/editor/schemas";
import { ROLE_BY_TYPE, newComponent } from "@/lib/editor/components";
import { FUSE_TABLE, checkFuse } from "@/lib/emma/fuses";
import { SPEC_FIELDS, TYPE_LABELS, placeholderFor } from "@/lib/specs";
import { COMPONENT_TYPES, type AudioComponent, type ComponentType, type WiringLink } from "@/lib/types";


export default function ComponentsPage() {
  const { content, update } = useEditor();
  const list = [...content.components].sort((a, b) => a.sort - b.sort);
  const [selected, setSelected] = useState<string | null>(list[0]?.id ?? null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // After a save an item can get its database id; keep the same row selected.
  const current = list.find((c) => c.id === selected) ?? (selected ? (list[selectedIndex] ?? null) : null);
  useEffect(() => {
    const i = list.findIndex((c) => c.id === selected);
    if (i >= 0 && i !== selectedIndex) setSelectedIndex(i);
    else if (i < 0 && current) setSelected(current.id);
  }, [list, selected, selectedIndex, current]);

  const setList = (next: AudioComponent[]) => update((c) => ({ ...c, components: next.map((x, i) => ({ ...x, sort: i + 1 })) }));
  const move = (i: number, d: -1 | 1) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setList(next);
  };
  const add = () => {
    const c = newComponent({ title: "New component", type: "speaker", existing: list });
    setList([...list, c]);
    setSelected(c.id);
  };
  const remove = (id: string) => {
    const gone = list.find((x) => x.id === id);
    update((c) => ({
      ...c,
      components: c.components.filter((x) => x.id !== id),
      wiring: gone ? c.wiring.filter((l) => l.from_key !== gone.key && l.to_key !== gone.key) : c.wiring,
    }));
    setSelected(list.find((x) => x.id !== id)?.id ?? null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Components">Products shown in the system and wiring diagrams, with their spec sheets.</PageTitle>
      <DiagramImageCard kind="system" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <Card title="List" className="self-start">
          <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
            {list.map((c, i) => (
              <li key={c.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-pressed={c.id === selected}
                  onClick={() => setSelected(c.id)}
                  className={`flex min-h-11 flex-1 cursor-pointer flex-col items-start justify-center rounded-xl px-3 py-1.5 text-left ${
                    c.id === selected ? "bg-lemon text-prussian" : "hover:bg-[#FAF9F5]"
                  }`}
                >
                  <span className="text-sm font-semibold">{c.title}</span>
                  <span className="font-mono text-[11px] text-[#55535c]">
                    {TYPE_LABELS[c.type]} · {c.key}
                  </span>
                </button>
                <button type="button" className={btn.ghost} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${c.title} up`}>
                  ↑
                </button>
                <button type="button" className={btn.ghost} disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${c.title} down`}>
                  ↓
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className={btn.secondary} onClick={add}>
            + Add component
          </button>
        </Card>

        {current ? (
          <ComponentEditor key={current.id} component={current} all={list} onRemove={() => remove(current.id)} />
        ) : (
          <Card>
            <p className="m-0">Select or add a component.</p>
          </Card>
        )}
      </div>

      <DiagramImageCard kind="wiring" />
      <WiringEditor />
    </div>
  );
}

function ComponentEditor({ component, all, onRemove }: { component: AudioComponent; all: AudioComponent[]; onRemove: () => void }) {
  const { update } = useEditor();
  const { register, watch, setValue, formState } = useForm<ComponentForm>({
    resolver: zodResolver(componentSchema),
    mode: "onChange",
    defaultValues: component,
  });
  const e = formState.errors;
  const type = watch("type");
  const keyNow = watch("key");
  const keyTaken = !!keyNow && all.some((c) => c.id !== component.id && c.key === keyNow);
  const specs = watch("specs") ?? [];

  useEffect(() => {
    const sub = watch((val) => {
      update((c) => {
        const prev = c.components.find((x) => x.id === component.id);
        // Hotspots are drawn in the diagram image cards, not in this form: keep them.
        const { hotspots: _h, wiring_hotspots: _w, ...formVal } = val as ComponentForm;
        void _h;
        void _w;
        const next = { ...prev!, ...formVal };
        const keyChanged = prev && prev.key !== next.key;
        return {
          ...c,
          components: c.components.map((x) => (x.id === component.id ? next : keyChanged && x.fed_by === prev.key ? { ...x, fed_by: next.key } : x)),
          wiring: keyChanged
            ? c.wiring.map((l) => ({ ...l, from_key: l.from_key === prev.key ? next.key : l.from_key, to_key: l.to_key === prev.key ? next.key : l.to_key }))
            : c.wiring,
          photos: keyChanged ? c.photos.map((p) => (p.component_key === prev.key ? { ...p, component_key: next.key } : p)) : c.photos,
        };
      });
    });
    return () => sub.unsubscribe();
  }, [watch, update, component.id]);

  const specValue = (k: string) => specs.find((s) => s.k === k)?.v ?? "";
  const setSpec = (k: string, v: string) => {
    const others = specs.filter((s) => s.k !== k);
    setValue("specs", [...others, { k, v }], { shouldDirty: true });
  };

  const feeders = all.filter((x) => x.id !== component.id && x.in_system);

  return (
    <Card
      title={component.title}
      actions={
        <button type="button" className={btn.danger} onClick={onRemove}>
          Delete
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Title" {...register("title")} error={e.title?.message} />
        <TextField
          label="Diagram key"
          {...register("key")}
          error={e.key?.message ?? (keyTaken ? "Another component already uses this key. Change it, or it is saved with a number added (e.g. amp_a_2)." : undefined)}
          hint="Used to link the diagrams, e.g. amp_a."
        />
        <SelectField
          label="Type"
          {...register("type", {
            onChange: (ev) => setValue("role", ROLE_BY_TYPE[ev.target.value as ComponentType]),
          })}
          error={e.type?.message}
        >
          {COMPONENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </SelectField>
        <TextField label="Role label" {...register("role")} error={e.role?.message} />
        <TextField label="Brand" placeholder="[BRAND]" {...register("brand")} error={e.brand?.message} />
        <TextField label="Model" placeholder="[MODEL]" {...register("model")} error={e.model?.message} />
      </div>

      <fieldset className="m-0 flex flex-col gap-3 rounded-xl border border-editor-border p-4">
        <legend className="px-1 text-sm font-bold">Spec fields · {TYPE_LABELS[type]}</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SPEC_FIELDS[type].map((k) => (
            <TextField key={`${type}-${k}`} label={k} placeholder={placeholderFor(k)} value={specValue(k)} onChange={(ev) => setSpec(k, ev.target.value)} />
          ))}
        </div>
      </fieldset>

      <TextArea label="EMMA note" rows={2} {...register("note")} error={e.note?.message} hint="Shown at the bottom of the spec popover." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UploadZone label="Product photo (transparent PNG)" kind="photo" focusable={false} folder="components" value={watch("photo_path")} onChange={(p) => setValue("photo_path", p, { shouldDirty: true })} />
        <UploadZone label="Spec sheet (PDF)" kind="pdf" folder="components" value={watch("pdf_path")} onChange={(p) => setValue("pdf_path", p, { shouldDirty: true })} />
      </div>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
        <Checkbox label="Show in System diagram" {...register("in_system")} />
        <Checkbox label="Show in Wiring diagram" {...register("in_wiring")} />
        <SelectField
          label="Signal from (system diagram)"
          className="min-w-[220px]"
          {...register("fed_by", { setValueAs: (v) => (v === "" ? null : v) })}
        >
          <option value="">— none (start of chain) —</option>
          {feeders.map((f) => (
            <option key={f.id} value={f.key}>
              {f.title}
            </option>
          ))}
        </SelectField>
      </div>
    </Card>
  );
}

function WiringEditor() {
  const { content, update } = useEditor();
  const nodes = content.components.filter((c) => c.in_wiring);
  const setLinks = (fn: (l: WiringLink[]) => WiringLink[]) => update((c) => ({ ...c, wiring: fn(c.wiring) }));
  const patch = (id: string, p: Partial<WiringLink>) => setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...p } : l)));
  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  return (
    <Card
      id="wiring"
      title="Wiring links · cable size & fuse"
      actions={
        <button
          type="button"
          className={btn.secondary}
          onClick={() => setLinks((ls) => [...ls, { id: crypto.randomUUID(), from_key: nodes[0]?.key ?? "", to_key: nodes[1]?.key ?? "", cable_mm2: null, fuse_a: null }])}
        >
          + Add link
        </button>
      }
    >
      <p className="m-0 text-sm text-[#4a4852]">
        Rate each fuse by the smallest cable in its circuit (VW75212). A warning appears when the fuse is above the table value.
      </p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {content.wiring.map((l, i) => {
          const chk = checkFuse(l.cable_mm2, l.fuse_a);
          return (
            <li key={l.id} className="grid grid-cols-1 items-end gap-3 rounded-xl border border-editor-border p-4 md:grid-cols-[1fr_1fr_180px_120px_auto]">
              <SelectField label="From" value={l.from_key} onChange={(ev) => patch(l.id, { from_key: ev.target.value })}>
                {nodes.map((n) => (
                  <option key={n.id} value={n.key}>
                    {n.title}
                  </option>
                ))}
              </SelectField>
              <SelectField label="To" value={l.to_key} onChange={(ev) => patch(l.id, { to_key: ev.target.value })}>
                {nodes.map((n) => (
                  <option key={n.id} value={n.key}>
                    {n.title}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Cable (mm²)" value={l.cable_mm2 ?? ""} onChange={(ev) => patch(l.id, { cable_mm2: num(ev.target.value) })}>
                <option value="">[__ mm²]</option>
                {FUSE_TABLE.map((r) => (
                  <option key={r.mm2} value={r.mm2}>
                    {r.mm2} mm² / {r.awg} AWG
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Fuse (A)"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="[__ A]"
                value={l.fuse_a ?? ""}
                onChange={(ev) => patch(l.id, { fuse_a: num(ev.target.value) })}
                error={l.fuse_a !== null && !(l.fuse_a > 0) ? "Must be above 0" : undefined}
              />
              <button type="button" className={btn.ghost} onClick={() => setLinks((ls) => ls.filter((x) => x.id !== l.id))} aria-label={`Remove link ${i + 1}`}>
                ✕
              </button>
              {chk.status === "over" && (
                <p role="alert" className="m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 md:col-span-5">
                  ⚠ {l.fuse_a} A is above the VW75212 maximum of {chk.maxA} A for {l.cable_mm2} mm² cable.
                </p>
              )}
              {chk.status === "ok" && <p className="m-0 text-sm text-emerald-700 md:col-span-5">✓ Within the table (max {chk.maxA} A).</p>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
