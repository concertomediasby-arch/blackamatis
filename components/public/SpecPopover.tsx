"use client";

import { forwardRef } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { isPlaceholder } from "@/lib/format";
import { specRows } from "@/lib/specs";
import { storageUrl } from "@/lib/supabase/env";
import type { AudioComponent } from "@/lib/types";

export const POPOVER_W = 360;
export const POPOVER_H = 470;

type Props = {
  id: string;
  component: AudioComponent;
  style: React.CSSProperties;
  /** Render in the page flow (full width) instead of floating next to the card. */
  inline?: boolean;
  onClose: () => void;
};

/** Small glass spec panel shown next to the product card inside a diagram (not a modal). */
export const SpecPopover = forwardRef<HTMLDivElement, Props>(function SpecPopover({ id, component: c, style, onClose, inline = false }, ref) {
  const brandModel = [c.brand, c.model].filter((x) => !isPlaceholder(x)).join(" ") || "[BRAND / MODEL]";
  const pdf = storageUrl(c.pdf_path, "pdfs");
  const titleId = `${id}-title`;
  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`${inline ? "relative w-full" : "absolute z-20"} flex flex-col gap-3.5 rounded-3xl border border-amber/55 p-5 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-[24px]`}
      style={{ ...style, width: inline ? undefined : POPOVER_W, background: "rgba(1,20,53,0.95)" }}
    >
      <div className="flex items-start gap-3.5">
        <Placeholder path={c.photo_path} label="Photo" alt={c.title} className="h-[72px] w-[72px] flex-none rounded-2xl text-[9px]" sizes="72px" fit="contain" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-mono text-[10px] tracking-[0.14em] text-amber">SPEC SHEET · {c.role}</span>
          <span id={titleId} className="font-display text-[28px] font-black leading-none">
            {c.title}
          </span>
          <span className="text-xs text-muted">{brandModel}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close spec sheet"
          className="-mr-2 -mt-2 flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <dl className="m-0 flex flex-col">
        {specRows(c.type, c.specs).map((s) => (
          <div key={s.k} className="grid grid-cols-[1.1fr_1fr] gap-3 border-b border-white/10 py-2">
            <dt className="font-mono text-[10px] uppercase leading-[18px] tracking-[0.1em] text-muted-2">{s.k}</dt>
            <dd className="m-0 text-[13px] leading-[18px]">{s.v}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-xs leading-normal text-muted">
        <span className="font-mono text-[10px] tracking-[0.12em] text-amber">EMMA NOTE · </span>
        {c.note}
      </p>
      {pdf ? (
        <a href={pdf} target="_blank" rel="noopener noreferrer" className="pill min-h-11 self-start bg-amber px-4 text-[13px] text-prussian">
          Download spec sheet (PDF)
        </a>
      ) : (
        <span className="self-start font-mono text-[11px] tracking-[0.1em] text-muted-2">[SPEC SHEET PDF NOT UPLOADED]</span>
      )}
    </div>
  );
});
