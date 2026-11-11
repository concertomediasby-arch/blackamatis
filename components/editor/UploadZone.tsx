"use client";

import { useId, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { uploadFile } from "@/lib/editor/upload";
import { splitPhoto } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";
import { FocusPicker } from "./FocusPicker";

type Props = {
  label: string;
  kind: "photo" | "pdf" | "video";
  folder: string;
  value: string | null;
  onChange: (path: string | null) => void;
  hint?: string;
  className?: string;
  /** Offer a focus point for photos the site crops (default true). Off for logos and the hero car. */
  focusable?: boolean;
};

/** Drop or choose a file. Photos are resized to max 2400 px WebP before upload. */
export function UploadZone({ label, kind, folder, value, onChange, hint, className = "", focusable = true }: Props) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const hasFocus = !!splitPhoto(value).focus;

  const handle = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    setErr(null);
    try {
      onChange(await uploadFile(f, kind, folder));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span id={`${id}-l`} className="text-sm font-semibold">
        {label}
      </span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void handle(e.dataTransfer.files[0]);
        }}
        className={`flex items-center gap-4 rounded-xl border-2 border-dashed p-3 ${over ? "border-prussian bg-lemon/20" : "border-editor-border bg-[#FAF9F5]"}`}
      >
        {kind === "photo" ? (
          <Placeholder path={value} label="No photo" tone="light" className="h-20 w-24 flex-none rounded-lg bg-white text-[9px]" sizes="96px" fit="contain" />
        ) : kind === "video" && storageUrl(value) ? (
          <video src={storageUrl(value)!} muted playsInline preload="metadata" className="h-20 w-24 flex-none rounded-lg bg-black object-cover" />
        ) : kind === "video" ? (
          <span className="flex h-20 w-24 flex-none items-center justify-center rounded-lg border border-editor-border bg-white font-mono text-[11px]">NO VIDEO</span>
        ) : (
          <span className="flex h-20 w-24 flex-none items-center justify-center rounded-lg border border-editor-border bg-white font-mono text-[11px]">
            {value ? "PDF ✓" : "NO PDF"}
          </span>
        )}
        <div className="flex flex-1 flex-col gap-2 text-sm">
          <span className="text-[#4a4852]">{busy ? "Uploading…" : hint ?? { photo: "Drop an image or choose a file", pdf: "Drop a PDF or choose a file", video: "Drop a video or choose a file" }[kind]}</span>
          <div className="flex flex-wrap gap-2">
            <label className="pill cursor-pointer border border-prussian bg-white px-4 text-prussian focus-within:outline focus-within:outline-2 focus-within:outline-prussian">
              Choose file
              <input
                type="file"
                accept={{ photo: "image/*", pdf: "application/pdf", video: "video/mp4,video/quicktime,video/webm" }[kind]}
                className="sr-only"
                aria-labelledby={`${id}-l`}
                onChange={(e) => void handle(e.target.files?.[0])}
              />
            </label>
            {value && kind === "photo" && focusable && (
              <button
                type="button"
                aria-expanded={focusOpen}
                onClick={() => setFocusOpen((o) => !o)}
                className="pill cursor-pointer border border-editor-border bg-white px-4"
              >
                {focusOpen ? "Done" : hasFocus ? "Crop focus ✓" : "Set crop focus"}
              </button>
            )}
            {value && (
              <button
                type="button"
                onClick={() => {
                  setFocusOpen(false);
                  onChange(null);
                }}
                className="pill cursor-pointer border border-editor-border bg-white px-4"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      {focusOpen && value && kind === "photo" && <FocusPicker value={value} onChange={onChange} />}
      {err && (
        <span role="alert" className="text-[13px] text-red-700">
          {err}
        </span>
      )}
    </div>
  );
}
