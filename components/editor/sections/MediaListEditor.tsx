"use client";

import { MAX_VIDEO_MB } from "@/lib/editor/upload";
import { youtubeId } from "@/lib/bonus-media";
import type { BonusMedia } from "@/lib/types";
import { TextArea, TextField, btn } from "../Field";
import { UploadZone } from "../UploadZone";

/**
 * Ordered photos and videos with a caption each (bonus Process / Result).
 * A video is an uploaded file or a link; a YouTube link plays on the page.
 */
export function MediaListEditor({
  label,
  intro,
  folder,
  numbered,
  value,
  onChange,
  photosOnly = false,
}: {
  label: string;
  intro: string;
  folder: string;
  /** Show items as steps (Process). */
  numbered: boolean;
  /** Offer only "+ Add photo" (e.g. the History slider). */
  photosOnly?: boolean;
  value: BonusMedia[];
  onChange: (next: BonusMedia[]) => void;
}) {
  const items = value ?? [];
  const patch = (id: string, p: Partial<BonusMedia>) =>
    onChange(items.map((m) => (m.id === id ? { ...m, ...p } : m)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const add = (kind: BonusMedia["kind"]) =>
    onChange([
      ...items,
      { id: crypto.randomUUID(), kind, path: null, url: null, caption: "" },
    ]);

  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-xl border border-editor-border p-4">
      <legend className="px-1 text-sm font-bold">{label}</legend>
      <p className="m-0 text-[13px] text-[#4a4852]">{intro}</p>
      {items.length > 0 && (
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((m, i) => {
            const name = `${numbered ? `Step ${i + 1}` : `Item ${i + 1}`} · ${m.kind === "video" ? "Video" : "Photo"}`;
            const useLink = m.kind === "video" && !m.path && m.url != null;
            const link = m.url ?? "";
            return (
              <li
                key={m.id}
                className="flex flex-col gap-3 rounded-xl bg-[#FAF9F5] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[12px] font-semibold tracking-[0.08em]">
                    {name.toUpperCase()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className={btn.ghost}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      aria-label={`Move ${name} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={btn.ghost}
                      disabled={i === items.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label={`Move ${name} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={btn.ghost}
                      onClick={() =>
                        onChange(items.filter((x) => x.id !== m.id))
                      }
                      aria-label={`Remove ${name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {m.kind === "photo" ? (
                  <UploadZone
                    label="Photo"
                    kind="photo"
                    folder={folder}
                    value={m.path}
                    onChange={(path) => patch(m.id, { path })}
                  />
                ) : (
                  <>
                    <div
                      role="radiogroup"
                      aria-label={`${name}: source`}
                      className="flex flex-wrap gap-2"
                    >
                      {[
                        {
                          on: !useLink,
                          text: "Upload a file",
                          next: { url: null },
                        },
                        {
                          on: useLink,
                          text: "Paste a link",
                          next: { path: null, url: "" },
                        },
                      ].map((o) => (
                        <button
                          key={o.text}
                          type="button"
                          role="radio"
                          aria-checked={o.on}
                          onClick={() => !o.on && patch(m.id, o.next)}
                          className={`pill border px-4 text-[13px] ${o.on ? "border-prussian bg-prussian text-lemon" : "border-editor-border bg-white"}`}
                        >
                          {o.text}
                        </button>
                      ))}
                    </div>
                    {useLink ? (
                      <TextField
                        label="Video link"
                        type="url"
                        inputMode="url"
                        placeholder="https://youtu.be/…"
                        value={link}
                        onChange={(e) => patch(m.id, { url: e.target.value })}
                        hint={
                          link && youtubeId(link)
                            ? "YouTube link: plays on the page."
                            : "YouTube links play on the page (unlisted is fine). Other links (Instagram, Drive) open in a new tab."
                        }
                      />
                    ) : (
                      <UploadZone
                        label="Video file"
                        kind="video"
                        folder={folder}
                        value={m.path}
                        onChange={(path) => patch(m.id, { path })}
                        hint={`MP4, MOV or WebM, max ${MAX_VIDEO_MB} MB. Longer videos: use a YouTube link.`}
                      />
                    )}
                  </>
                )}
                <TextArea
                  label="Caption"
                  rows={2}
                  maxLength={300}
                  value={m.caption}
                  onChange={(e) => patch(m.id, { caption: e.target.value })}
                  hint={
                    numbered
                      ? "What happens in this step."
                      : "What the result shows."
                  }
                />
              </li>
            );
          })}
        </ol>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btn.secondary}
          onClick={() => add("photo")}
        >
          + Add photo
        </button>
        {!photosOnly && (
          <button
            type="button"
            className={btn.secondary}
            onClick={() => add("video")}
          >
            + Add video
          </button>
        )}
      </div>
    </fieldset>
  );
}
