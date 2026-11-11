"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Card, Checkbox, PageTitle, SelectField, TextArea, TextField, btn } from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { UploadZone } from "@/components/editor/UploadZone";
import { MediaListEditor } from "@/components/editor/sections/MediaListEditor";
import { Placeholder } from "@/components/ui/Placeholder";
import { bonusSchema, type BonusForm } from "@/lib/editor/schemas";
import { BONUS_MODES, DEFAULT_BONUS_MODE, EXECUTION_LABELS, estimateBonus, requestPoints, type BonusMode, type Execution } from "@/lib/emma/bonus";
import {
  BONUS_GROUPS,
  BONUS_LOCATIONS,
  ELEMENT_OPTIONS,
  STRENGTHS,
  bonusCode,
  groupInfo,
  nextBonusNo,
  type BonusGroup,
  type Strength,
} from "@/lib/emma/bonus-locations";
import type { BonusMedia, BonusRequest } from "@/lib/types";

const STRENGTH_STYLE: Record<Strength, string> = {
  strong: "bg-emerald-100 text-emerald-900 border-emerald-300",
  medium: "bg-amber-100 text-amber-900 border-amber-300",
  weak: "bg-slate-100 text-slate-800 border-slate-300",
  unlikely: "bg-red-50 text-red-800 border-red-200",
};

function StrengthBadge({ value }: { value: Strength | null }) {
  if (!value) return <span className="text-[#8a8794]">—</span>;
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STRENGTH_STYLE[value]}`}>{value}</span>;
}

export default function BonusEditorPage() {
  const { content, update } = useEditor();
  const reqs = [...content.bonus].sort((a, b) => a.sort - b.sort);
  const [mode, setMode] = useState<BonusMode>(DEFAULT_BONUS_MODE);
  const [editing, setEditing] = useState<{ req: BonusRequest; isNew: boolean } | null>(null);
  const est = estimateBonus(reqs, mode);
  const cls = BONUS_MODES[mode];

  const save = (r: BonusRequest) => {
    const fixed = { ...r, code: bonusCode(r.group, r.no) };
    update((c) => {
      const exists = c.bonus.some((b) => b.id === r.id);
      return { ...c, bonus: exists ? c.bonus.map((b) => (b.id === r.id ? fixed : b)) : [...c.bonus, fixed] };
    });
    setEditing(null);
  };
  const patch = (id: string, p: Partial<BonusRequest>) => update((c) => ({ ...c, bonus: c.bonus.map((b) => (b.id === id ? { ...b, ...p } : b)) }));
  const remove = (id: string) => update((c) => ({ ...c, bonus: c.bonus.filter((b) => b.id !== id) }));
  const move = (i: number, d: -1 | 1) => {
    const next = [...reqs];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    update((c) => ({ ...c, bonus: next.map((b, k) => ({ ...b, sort: k + 1 })) }));
  };

  const newRequest = () => {
    const no = nextBonusNo(reqs);
    setEditing({
      isNew: true,
      req: {
        id: crypto.randomUUID(),
        no,
        code: bonusCode("new", no),
        group: "new",
        title: "",
        element: "B",
        description: "",
        photo_path: null,
        process: [],
        result: [],
        submit: false,
        idea: false,
        execution: 0,
        strength: null,
        sort: Math.max(0, ...reqs.map((r) => r.sort)) + 1,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Bonus Requests">
        Requests across the whole car. Max 3 points each: 1 for the idea, +1 average or +2 good execution. Strength is for the team only and never shown on the
        public site.
      </PageTitle>
      <Card
        title="Requests"
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <SelectField label="Bonus class" className="min-w-[230px]" value={mode} onChange={(e) => setMode(e.target.value as BonusMode)}>
              <option value="unlimited">Unlimited (≤ 50 requests, 100 pts)</option>
              <option value="limited">Limited (≤ 20 requests, 15 pts)</option>
            </SelectField>
            <button type="button" className={btn.primary} onClick={newRequest}>
              + New request
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-live="polite">
          <span className={`font-mono text-sm font-semibold tracking-[0.1em] ${est.overSubmitted ? "text-red-700" : ""}`}>
            SUBMITTED {est.submitted} / {cls.maxRequests}
          </span>
          <span className="text-sm text-[#4a4852]">
            {est.candidates} candidates · estimate {est.score} / {est.cap} pts
          </span>
        </div>
        {est.overSubmitted && (
          <p role="alert" className="m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            ⚠ {est.submitted} requests ticked Submit, above the {cls.label} limit of {cls.maxRequests}. Untick the weakest ones.
          </p>
        )}
        {est.tooManyCandidates && !est.overSubmitted && (
          <p className="m-0 rounded-lg bg-[#FFF6CC] px-3 py-2 text-sm">
            {est.candidates} candidates listed. {cls.label} allows {cls.maxRequests} requests, so tick the strongest {cls.maxRequests} with Submit before the
            presentation.
          </p>
        )}
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-[#55535c]">
                {["Code", "Name", "Group", "Element", "Strength", "Photo", "Submit", "Pts", ""].map((h, i) => (
                  <th key={i} scope="col" className="border-b border-editor-border py-2 pr-3 font-semibold">
                    {h || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reqs.map((r, i) => (
                <tr key={r.id} className={r.submit ? "bg-[#FFFBE0]" : ""}>
                  <td className="border-b border-editor-border py-2 pr-3 font-mono font-semibold">{r.code}</td>
                  <th scope="row" className="max-w-[320px] border-b border-editor-border py-2 pr-3 text-left font-semibold">
                    {r.title}
                  </th>
                  <td className="border-b border-editor-border py-2 pr-3">{groupInfo(r.group).label}</td>
                  <td className="border-b border-editor-border py-2 pr-3">{r.element}</td>
                  <td className="border-b border-editor-border py-2 pr-3">
                    <StrengthBadge value={r.strength} />
                  </td>
                  <td className="border-b border-editor-border py-2 pr-3">
                    <Placeholder path={r.photo_path} label="—" alt={r.title} tone="light" className="h-11 w-11 rounded-lg text-[8px]" sizes="44px" />
                  </td>
                  <td className="border-b border-editor-border py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={r.submit}
                      onChange={(e) => patch(r.id, { submit: e.target.checked })}
                      aria-label={`Submit ${r.code}`}
                      className="h-5 w-5 accent-prussian"
                    />
                  </td>
                  <td className="border-b border-editor-border py-2 pr-3 font-bold">{requestPoints(r)}</td>
                  <td className="border-b border-editor-border py-2">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" className={btn.ghost} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${r.code} up`}>
                        ↑
                      </button>
                      <button type="button" className={btn.ghost} disabled={i === reqs.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${r.code} down`}>
                        ↓
                      </button>
                      <button type="button" className={btn.secondary} onClick={() => setEditing({ req: r, isNew: false })}>
                        Edit
                      </button>
                      <button type="button" className={btn.ghost} onClick={() => remove(r.id)} aria-label={`Remove ${r.code}`}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {editing && <BonusDrawer request={editing.req} isNew={editing.isNew} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

const FREE_TEXT = "__free";

function BonusDrawer({ request, isNew, onSave, onClose }: { request: BonusRequest; isNew: boolean; onSave: (r: BonusRequest) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [location, setLocation] = useState(FREE_TEXT);
  const { register, handleSubmit, control, formState, watch, setValue } = useForm<BonusForm>({
    resolver: zodResolver(bonusSchema),
    defaultValues: request,
  });
  const e = formState.errors;
  const group = watch("group");
  const element = watch("element");

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  const pickLocation = (v: string) => {
    setLocation(v);
    if (v === FREE_TEXT) return;
    const [g, name] = v.split("::");
    setValue("group", g as BonusGroup, { shouldValidate: true });
    setValue("title", name, { shouldValidate: true });
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="bonus-drawer-title"
      className="editor m-0 ml-auto h-full max-h-none w-full max-w-[560px] bg-white p-0 text-[#14141a] backdrop:bg-black/40"
    >
      <form noValidate onSubmit={handleSubmit((v) => onSave(v as BonusRequest))} className="flex h-full flex-col gap-5 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h2 id="bonus-drawer-title" className="m-0 text-xl font-bold">
            {isNew ? "New request" : "Edit request"} · <span className="font-mono">{bonusCode(group, request.no)}</span>
          </h2>
          <button type="button" className={btn.ghost} onClick={() => ref.current?.close()} aria-label="Close">
            ✕
          </button>
        </div>

        <SelectField label="Location" value={location} onChange={(ev) => pickLocation(ev.target.value)} hint="Pick a spot on the car, or write your own name below.">
          <option value={FREE_TEXT}>Free text (type the name below)</option>
          {BONUS_GROUPS.filter((g) => g.key !== "new").map((g) => (
            <optgroup key={g.key} label={g.label}>
              {BONUS_LOCATIONS[g.key as Exclude<BonusGroup, "new">].map((l) => (
                <option key={l} value={`${g.key}::${l}`}>
                  {l}
                </option>
              ))}
            </optgroup>
          ))}
        </SelectField>
        <TextField label="Name" {...register("title")} error={e.title?.message} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField label="Group" {...register("group")} error={e.group?.message}>
            {BONUS_GROUPS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Element" {...register("element")} error={e.element?.message}>
            {[...new Set([...ELEMENT_OPTIONS, element].filter(Boolean))].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </SelectField>
          <SelectField label="Strength (team only)" {...register("strength", { setValueAs: (v) => (v === "" || v == null ? null : v) })} error={e.strength?.message}>
            <option value="">—</option>
            {STRENGTHS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
        </div>
        <TextArea
          label="Idea text"
          rows={5}
          {...register("description")}
          error={e.description?.message}
          hint="Shown under Idea on the public page: what the element is, why it is special, how it fits the theme. A blank line starts a new paragraph."
        />
        <Controller
          control={control}
          name="photo_path"
          render={({ field }) => <UploadZone label="Thumbnail photo" kind="photo" folder="bonus" value={field.value} onChange={field.onChange} />}
        />
        <Controller
          control={control}
          name="process"
          render={({ field }) => (
            <MediaListEditor
              label="Process"
              intro="How it was made, step by step. Each photo or video gets a caption; visitors see them as Step 01, 02, …"
              folder="bonus/process"
              numbered
              value={(field.value ?? []) as BonusMedia[]}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="result"
          render={({ field }) => (
            <MediaListEditor
              label="Result"
              intro="The finished element. Each photo or video gets a caption."
              folder="bonus/result"
              numbered={false}
              value={(field.value ?? []) as BonusMedia[]}
              onChange={field.onChange}
            />
          )}
        />
        <p className="m-0 text-[13px] text-[#55535c]">Below is for the team only; the public page shows no scores.</p>
        <div className="flex flex-wrap gap-x-6">
          <Checkbox label="Submit with the presentation" {...register("submit")} />
          <Checkbox label="Idea +1" {...register("idea")} />
        </div>
        <SelectField label="Execution (own estimate)" {...register("execution", { valueAsNumber: true })}>
          {([0, 1, 2] as Execution[]).map((v) => (
            <option key={v} value={v}>
              {EXECUTION_LABELS[v]}
            </option>
          ))}
        </SelectField>
        <p className="m-0 text-sm text-[#4a4852]">Estimated: {requestPoints({ idea: !!watch("idea"), execution: Number(watch("execution")) || 0 })} / 3 pts</p>
        <div className="mt-auto flex gap-2">
          <button type="submit" className={btn.primary}>
            {isNew ? "Add request" : "Save request"}
          </button>
          <button type="button" className={btn.secondary} onClick={() => ref.current?.close()}>
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}
