"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Card, Checkbox, PageTitle, SelectField, TextArea, TextField, btn } from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { UploadZone } from "@/components/editor/UploadZone";
import { bonusSchema, type BonusForm } from "@/lib/editor/schemas";
import { BONUS_ELEMENTS, BONUS_MODES, EXECUTION_LABELS, estimateBonus, requestPoints, type BonusMode, type Execution } from "@/lib/emma/bonus";
import type { BonusRequest } from "@/lib/types";

export default function BonusEditorPage() {
  const { content, update } = useEditor();
  const reqs = [...content.bonus].sort((a, b) => a.no - b.no);
  const [mode, setMode] = useState<BonusMode>(content.vehicle.class === "XU" ? "unlimited" : "limited");
  const [editing, setEditing] = useState<BonusRequest | null>(null);
  const est = estimateBonus(reqs, mode);
  const { maxRequests } = BONUS_MODES[mode];

  const save = (r: BonusRequest) => {
    update((c) => {
      const exists = c.bonus.some((b) => b.id === r.id);
      return { ...c, bonus: exists ? c.bonus.map((b) => (b.id === r.id ? r : b)) : [...c.bonus, r] };
    });
    setEditing(null);
  };
  const remove = (id: string) =>
    update((c) => ({
      ...c,
      bonus: c.bonus
        .filter((b) => b.id !== id)
        .sort((a, b) => a.no - b.no)
        .map((b, i) => ({ ...b, no: i + 1 })),
    }));

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Bonus Requests">Requests handed in with the presentation. Max 3 points each: 1 for the idea, +1 average or +2 good execution.</PageTitle>
      <Card
        title="Requests"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <SelectField label="Bonus class" className="min-w-[200px]" value={mode} onChange={(e) => setMode(e.target.value as BonusMode)}>
              <option value="limited">Limited (≤ 20 requests, 15 pts)</option>
              <option value="unlimited">Unlimited (≤ 50 requests, 100 pts)</option>
            </SelectField>
            <button
              type="button"
              className={`${btn.primary} self-end`}
              onClick={() =>
                setEditing({ id: `new-${crypto.randomUUID()}`, no: reqs.length + 1, title: "", element: "A", description: "", photo_path: null, idea: false, execution: 0 })
              }
            >
              + Add request
            </button>
          </div>
        }
      >
        {est.overCap ? (
          <p role="alert" className="m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            ⚠ {reqs.length} requests is over the {BONUS_MODES[mode].label} limit of {maxRequests}. Only the first {maxRequests} count.
          </p>
        ) : (
          <p className="m-0 text-sm text-[#4a4852]">
            {reqs.length} / {maxRequests} requests · estimate {est.score} / {est.cap} pts (personal estimate).
          </p>
        )}
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-[#55535c]">
                {["No", "Title", "Element", "Idea", "Execution", "Pts", ""].map((h) => (
                  <th key={h} scope="col" className="border-b border-editor-border py-2 pr-3 font-semibold">
                    {h || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r.id} className={r.no > maxRequests ? "bg-red-50" : ""}>
                  <td className="border-b border-editor-border py-2 pr-3 font-mono">{String(r.no).padStart(2, "0")}</td>
                  <th scope="row" className="border-b border-editor-border py-2 pr-3 text-left font-semibold">
                    {r.title}
                  </th>
                  <td className="border-b border-editor-border py-2 pr-3">
                    {r.element} · {BONUS_ELEMENTS.find((e) => e.key === r.element)?.title}
                  </td>
                  <td className="border-b border-editor-border py-2 pr-3">{r.idea ? "✓" : "—"}</td>
                  <td className="border-b border-editor-border py-2 pr-3">{EXECUTION_LABELS[r.execution]}</td>
                  <td className="border-b border-editor-border py-2 pr-3 font-bold">{requestPoints(r)}</td>
                  <td className="border-b border-editor-border py-2">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" className={btn.secondary} onClick={() => setEditing(r)}>
                        Edit
                      </button>
                      <button type="button" className={btn.ghost} onClick={() => remove(r.id)} aria-label={`Remove request ${r.no}`}>
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
      {editing && <BonusDrawer request={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function BonusDrawer({ request, onSave, onClose }: { request: BonusRequest; onSave: (r: BonusRequest) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { register, handleSubmit, control, formState, watch } = useForm<BonusForm>({ resolver: zodResolver(bonusSchema), defaultValues: request });
  const e = formState.errors;

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="bonus-drawer-title"
      className="editor m-0 ml-auto h-full max-h-none w-full max-w-[520px] bg-white p-0 text-[#14141a] backdrop:bg-black/40"
    >
      <form noValidate onSubmit={handleSubmit((v) => onSave(v as BonusRequest))} className="flex h-full flex-col gap-5 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h2 id="bonus-drawer-title" className="m-0 text-xl font-bold">
            Request {String(request.no).padStart(2, "0")}
          </h2>
          <button type="button" className={btn.ghost} onClick={() => ref.current?.close()} aria-label="Close">
            ✕
          </button>
        </div>
        <TextField label="Title" {...register("title")} error={e.title?.message} />
        <SelectField label="Element" {...register("element")} error={e.element?.message}>
          {BONUS_ELEMENTS.map((el) => (
            <option key={el.key} value={el.key}>
              {el.key} · {el.title}
            </option>
          ))}
        </SelectField>
        <TextArea label="Description" rows={5} {...register("description")} error={e.description?.message} />
        <Controller
          control={control}
          name="photo_path"
          render={({ field }) => <UploadZone label="Photo" kind="photo" folder="bonus" value={field.value} onChange={field.onChange} />}
        />
        <Checkbox label="Idea submitted (+1)" {...register("idea")} />
        <SelectField label="Execution (own estimate)" {...register("execution", { valueAsNumber: true })}>
          {([0, 1, 2] as Execution[]).map((v) => (
            <option key={v} value={v}>
              {EXECUTION_LABELS[v]}
            </option>
          ))}
        </SelectField>
        <p className="m-0 text-sm text-[#4a4852]">Estimated: {requestPoints({ idea: !!watch("idea"), execution: (Number(watch("execution")) || 0) as Execution })} / 3 pts</p>
        <div className="mt-auto flex gap-2">
          <button type="submit" className={btn.primary}>
            Save request
          </button>
          <button type="button" className={btn.secondary} onClick={() => ref.current?.close()}>
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}
