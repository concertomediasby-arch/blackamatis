"use client";

import { Card, PageTitle, TextArea, TextField, btn } from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { RowActions } from "@/components/editor/RowActions";
import { moveItem, newId, useList } from "@/components/editor/useList";
import { fieldErrors, tuningNotesSchema, tuningRowSchema } from "@/lib/editor/schemas";
import type { Vehicle } from "@/lib/types";

const NOTES: { key: "tuning_eq" | "tuning_listening" | "tuning_measurement"; label: string; hint: string }[] = [
  { key: "tuning_eq", label: "EQ", hint: "Number of bands, per channel or global, the main corrections." },
  { key: "tuning_listening", label: "Listening position", hint: "Driver seat, centre or both: what the system is tuned for." },
  { key: "tuning_measurement", label: "Measurement tool", hint: "Microphone and software used." },
];

export default function TuningEditorPage() {
  const { content, update } = useEditor();
  const rows = useList("tuning");
  const sorted = [...rows.items].sort((a, b) => a.sort - b.sort);
  const v = content.vehicle;
  const noteErrors = fieldErrors(tuningNotesSchema, v);
  const setNote = (key: keyof Vehicle, value: string) => update((c) => ({ ...c, vehicle: { ...c.vehicle, [key]: value } }));

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Tuning">Crossover points, time alignment and how the system was tuned. Shown in the Tuning notes section of the Installation page.</PageTitle>

      <Card
        title="Crossover & time alignment"
        id="crossover"
        actions={
          <button
            type="button"
            className={btn.secondary}
            onClick={() =>
              rows.setItems((xs) => [...xs, { id: newId(), driver: "", hpf_hz: "", lpf_hz: "", slope_db: "", time_align_ms: "", eq_bands: "", sort: xs.length + 1 }])
            }
          >
            + Add driver
          </button>
        }
      >
        <p className="m-0 text-sm text-[#4a4852]">One row per driver. Write values with units, e.g. “80 Hz”, “24 dB/oct”, “1.25 ms”.</p>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {sorted.map((t, i) => {
            const e = fieldErrors(tuningRowSchema, t);
            return (
              <li key={t.id} className="grid grid-cols-2 items-start gap-3 rounded-xl border border-editor-border p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_auto]">
                <TextField className="col-span-2 md:col-span-1" label="Driver" value={t.driver} onChange={(ev) => rows.patch(t.id, { driver: ev.target.value })} error={e.driver} />
                <TextField label="HPF" placeholder="[__ Hz]" value={t.hpf_hz} onChange={(ev) => rows.patch(t.id, { hpf_hz: ev.target.value })} error={e.hpf_hz} />
                <TextField label="LPF" placeholder="[__ Hz]" value={t.lpf_hz} onChange={(ev) => rows.patch(t.id, { lpf_hz: ev.target.value })} error={e.lpf_hz} />
                <TextField label="Slope" placeholder="[__ dB/oct]" value={t.slope_db} onChange={(ev) => rows.patch(t.id, { slope_db: ev.target.value })} error={e.slope_db} />
                <TextField label="Time align" placeholder="[__ ms]" value={t.time_align_ms} onChange={(ev) => rows.patch(t.id, { time_align_ms: ev.target.value })} error={e.time_align_ms} />
                <TextField label="EQ bands" placeholder="[__]" value={t.eq_bands} onChange={(ev) => rows.patch(t.id, { eq_bands: ev.target.value })} error={e.eq_bands} />
                <div className="md:pt-7">
                  <RowActions
                    index={i}
                    count={sorted.length}
                    label={t.driver || `driver ${i + 1}`}
                    onMove={(to) => rows.setItems(() => moveItem(sorted, i, to))}
                    onRemove={() => rows.remove(t.id)}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card title="Tuning notes" id="notes">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {NOTES.map((n) => (
            <TextArea key={n.key} label={n.label} rows={4} value={v[n.key]} onChange={(ev) => setNote(n.key, ev.target.value)} hint={n.hint} error={noteErrors[n.key]} />
          ))}
        </div>
        <p className="m-0 text-sm text-[#55535c]">The target curve chart stays a placeholder until measured data is added.</p>
      </Card>
    </div>
  );
}
