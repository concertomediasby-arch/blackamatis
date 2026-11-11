"use client";

import { Card, PageTitle, TextField, btn } from "@/components/editor/Field";
import { RowActions } from "@/components/editor/RowActions";
import { newId, useList } from "@/components/editor/useList";
import { competitionSchema, fieldErrors } from "@/lib/editor/schemas";

export default function HistoryEditorPage() {
  const comps = useList("competitions");

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="History">
        The competition results table. The timeline is edited in Vehicle &
        Story.
      </PageTitle>

      <Card
        title="Competition history"
        id="competitions"
        actions={
          <button
            type="button"
            className={btn.secondary}
            onClick={() =>
              comps.setItems((xs) => [
                ...xs,
                {
                  id: newId(),
                  event: "",
                  city: "",
                  category: "",
                  install_points: "",
                  result: "",
                  date: null,
                },
              ])
            }
          >
            + Add event
          </button>
        }
      >
        <p className="m-0 text-sm text-[#4a4852]">
          Shown on the History page, sorted by date. Update after each event.
        </p>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {comps.items.map((c, i) => {
            const e = fieldErrors(competitionSchema, c);
            return (
              <li
                key={c.id}
                className="grid grid-cols-1 items-start gap-3 rounded-xl border border-editor-border p-4 md:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <TextField
                  label="Event"
                  value={c.event}
                  onChange={(ev) =>
                    comps.patch(c.id, { event: ev.target.value })
                  }
                  error={e.event}
                />
                <TextField
                  label="City"
                  value={c.city}
                  onChange={(ev) =>
                    comps.patch(c.id, { city: ev.target.value })
                  }
                  error={e.city}
                />
                <TextField
                  label="Date"
                  type="date"
                  value={c.date ?? ""}
                  onChange={(ev) =>
                    comps.patch(c.id, { date: ev.target.value || null })
                  }
                  error={e.date}
                />
                <div className="md:self-end">
                  <RowActions
                    index={i}
                    count={comps.items.length}
                    label={`event ${i + 1}`}
                    onRemove={() => comps.remove(c.id)}
                  />
                </div>
                <TextField
                  label="Category"
                  value={c.category}
                  onChange={(ev) =>
                    comps.patch(c.id, { category: ev.target.value })
                  }
                  error={e.category}
                />
                <TextField
                  label="Install points"
                  placeholder="e.g. 198 / 231"
                  value={c.install_points}
                  onChange={(ev) =>
                    comps.patch(c.id, { install_points: ev.target.value })
                  }
                  error={e.install_points}
                />
                <TextField
                  label="Result"
                  placeholder="e.g. 1st place"
                  value={c.result}
                  onChange={(ev) =>
                    comps.patch(c.id, { result: ev.target.value })
                  }
                  error={e.result}
                />
              </li>
            );
          })}
        </ol>
        {comps.items.length === 0 && (
          <p className="m-0 text-sm text-[#55535c]">No events yet.</p>
        )}
      </Card>
    </div>
  );
}
