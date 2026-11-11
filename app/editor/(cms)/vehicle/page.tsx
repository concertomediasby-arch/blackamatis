"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Card, PageTitle, SelectField, TextArea, TextField, btn } from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { UploadZone } from "@/components/editor/UploadZone";
import { STATEMENT_MAX_WORDS, storyFormSchema, wordCount, type StoryForm } from "@/lib/editor/schemas";
import { CLASSES, CLASS_INFO } from "@/lib/emma/matrix";

const newId = () => `new-${crypto.randomUUID()}`;

export default function VehiclePage() {
  const { content, update } = useEditor();
  const v = content.vehicle;

  const form = useForm<StoryForm>({
    resolver: zodResolver(storyFormSchema),
    mode: "onChange",
    defaultValues: {
      ...v,
      milestones: [...content.milestones].sort((a, b) => a.sort - b.sort),
      team: [...content.team].sort((a, b) => a.sort - b.sort),
    },
  });
  const { register, watch, formState, setValue, control } = form;
  const e = formState.errors;
  const ms = useFieldArray({ control, name: "milestones", keyName: "_k" });
  const team = useFieldArray({ control, name: "team", keyName: "_k" });

  // Mirror form values into the editor draft (autosave picks them up).
  useEffect(() => {
    const sub = watch((val) => {
      const { milestones, team: t, ...vehicle } = val as StoryForm;
      update((c) => ({
        ...c,
        vehicle: { ...c.vehicle, ...vehicle },
        milestones: (milestones ?? []).map((m, i) => ({ ...m, sort: i + 1 })),
        team: (t ?? []).map((m, i) => ({ ...m, sort: i + 1 })),
      }));
    });
    return () => sub.unsubscribe();
  }, [watch, update]);

  const words = wordCount(watch("statement") ?? "");

  return (
    <form noValidate onSubmit={(ev) => ev.preventDefault()} className="flex flex-col gap-6">
      <PageTitle title="Vehicle & Story">Vehicle data, the two faces, the project statement, team and build timeline.</PageTitle>

      <Card title="Vehicle">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField label="Project name" {...register("name")} error={e.name?.message} />
          <TextField label="Car" {...register("model")} error={e.model?.message} />
          <TextField label="Year / generation" placeholder="[YEAR]" {...register("year")} error={e.year?.message} />
          <TextField label="EMMA category" placeholder="[CATEGORY]" {...register("category")} error={e.category?.message} hint="Shown in the header pill." />
          <SelectField label="Install class" {...register("class")} error={e.class?.message}>
            {CLASSES.map((k) => (
              <option key={k} value={k}>
                {CLASS_INFO[k].label} · {CLASS_INFO[k].name}
              </option>
            ))}
          </SelectField>
          <TextField label="Event" {...register("event")} error={e.event?.message} />
        </div>
        <UploadZone
          label="Hero car photo (transparent PNG)"
          kind="photo"
          folder="vehicle"
          value={v.car_photo_path}
          onChange={(p) => update((c) => ({ ...c, vehicle: { ...c.vehicle, car_photo_path: p } }))}
          hint="Cut-out photo on a transparent background. Shown over the AMATIS word."
        />
      </Card>

      <div id="faces">
        <Card title="Two faces">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField label="Dark side name" {...register("dark_side_name")} error={e.dark_side_name?.message} />
            <TextField label="Light side name" {...register("light_side_name")} error={e.light_side_name?.message} />
            <TextArea label="Dark side description" {...register("dark_side_body")} error={e.dark_side_body?.message} />
            <TextArea label="Light side description" {...register("light_side_body")} error={e.light_side_body?.message} />
          </div>
        </Card>
      </div>

      <Card title="Statement & story">
        <TextArea
          label="Project statement"
          {...register("statement")}
          error={e.statement?.message}
          hint={
            <span aria-live="polite" className={words > STATEMENT_MAX_WORDS ? "font-semibold text-red-700" : ""}>
              {words} / {STATEMENT_MAX_WORDS} words
            </span>
          }
        />
        <TextArea label="History summary" {...register("story")} error={e.story?.message} />
      </Card>

      <Card title="Team & links">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField label="Owner" {...register("owner")} error={e.owner?.message} />
          <TextField label="Installer / workshop" {...register("installer")} error={e.installer?.message} />
          <TextField label="Designer" {...register("designer")} error={e.designer?.message} />
          <TextField label="Tuner" {...register("tuner")} error={e.tuner?.message} />
          <TextField label="Instagram" placeholder="@handle" {...register("instagram")} error={e.instagram?.message} />
          <TextField label="Website" type="url" placeholder="https://" {...register("website")} error={e.website?.message} />
        </div>
        <h3 className="m-0 mt-2 text-base font-bold">Team cards</h3>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {team.fields.map((f, i) => (
            <li key={f._k} className="grid grid-cols-1 items-end gap-3 rounded-xl border border-editor-border p-4 md:grid-cols-[1fr_1.4fr_2fr_auto]">
              <TextField label="Role" {...register(`team.${i}.role`)} error={e.team?.[i]?.role?.message} />
              <TextField label="Name" {...register(`team.${i}.name`)} error={e.team?.[i]?.name?.message} />
              <TextField label="One line" {...register(`team.${i}.line`)} error={e.team?.[i]?.line?.message} />
              <RowButtons i={i} n={team.fields.length} move={team.move} remove={team.remove} label={`team member ${i + 1}`} />
              <UploadZone
                className="md:col-span-4"
                label="Photo"
                kind="photo"
                folder="team"
                value={watch(`team.${i}.photo_path`)}
                onChange={(p) => setValue(`team.${i}.photo_path`, p, { shouldDirty: true })}
              />
            </li>
          ))}
        </ol>
        <button type="button" className={`${btn.secondary} self-start`} onClick={() => team.append({ id: newId(), role: "", name: "", line: "", photo_path: null, sort: 0 })}>
          + Add team member
        </button>
      </Card>

      <div id="timeline">
        <Card title="Build timeline">
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {ms.fields.map((f, i) => (
              <li key={f._k} className="grid grid-cols-1 items-start gap-3 rounded-xl border border-editor-border p-4 md:grid-cols-[160px_1fr_auto]">
                <TextField label="When" placeholder="[MONTH YEAR]" {...register(`milestones.${i}.when_label`)} error={e.milestones?.[i]?.when_label?.message} />
                <TextField label="Title" {...register(`milestones.${i}.title`)} error={e.milestones?.[i]?.title?.message} />
                <div className="self-end">
                  <RowButtons i={i} n={ms.fields.length} move={ms.move} remove={ms.remove} label={`milestone ${i + 1}`} />
                </div>
                <TextArea className="md:col-span-3" label="Description" rows={2} {...register(`milestones.${i}.body`)} error={e.milestones?.[i]?.body?.message} />
                <UploadZone
                  className="md:col-span-3"
                  label="Photo"
                  kind="photo"
                  folder="milestones"
                  value={watch(`milestones.${i}.photo_path`)}
                  onChange={(p) => setValue(`milestones.${i}.photo_path`, p, { shouldDirty: true })}
                />
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={`${btn.secondary} self-start`}
            onClick={() => ms.append({ id: newId(), when_label: "", title: "", body: "", photo_path: null, sort: 0 })}
          >
            + Add milestone
          </button>
        </Card>
      </div>
    </form>
  );
}

function RowButtons({ i, n, move, remove, label }: { i: number; n: number; move: (a: number, b: number) => void; remove: (i: number) => void; label: string }) {
  return (
    <div className="flex gap-1.5">
      <button type="button" className={btn.ghost} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${label} up`}>
        ↑
      </button>
      <button type="button" className={btn.ghost} disabled={i === n - 1} onClick={() => move(i, i + 1)} aria-label={`Move ${label} down`}>
        ↓
      </button>
      <button type="button" className={btn.ghost} onClick={() => remove(i)} aria-label={`Remove ${label}`}>
        ✕
      </button>
    </div>
  );
}
