"use client";

import { useRef } from "react";

type Option<K extends string> = { key: K; label: string; count?: number };

type Props<K extends string> = {
  options: readonly Option<K>[];
  value: K;
  onChange: (k: K) => void;
  label: string;
  tone?: "dark" | "light";
  /** "tabs" = real tablist with arrow keys; "toggle" = group of aria-pressed buttons. */
  mode?: "tabs" | "toggle";
  idPrefix?: string;
};

/** Pill-shaped segmented control. Arrow keys move between options. */
export function SegmentedTabs<K extends string>({ options, value, onChange, label, tone = "dark", mode = "toggle", idPrefix }: Props<K>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let j = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % options.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + options.length) % options.length;
    if (e.key === "Home") j = 0;
    if (e.key === "End") j = options.length - 1;
    if (j >= 0) {
      e.preventDefault();
      onChange(options[j].key);
      refs.current[j]?.focus();
    }
  };

  const active = tone === "dark" ? "bg-amber text-prussian border-amber" : "bg-black text-lemon border-black";
  const idle = tone === "dark" ? "bg-transparent text-ink border-white/40 hover:border-amber" : "bg-transparent text-black border-black/50 hover:border-black";

  return (
    <div role={mode === "tabs" ? "tablist" : "group"} aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o, i) => {
        const on = o.key === value;
        const a11y =
          mode === "tabs"
            ? {
                role: "tab" as const,
                "aria-selected": on,
                "aria-controls": idPrefix ? `${idPrefix}-panel` : undefined,
                id: idPrefix ? `${idPrefix}-tab-${o.key}` : undefined,
                tabIndex: on ? 0 : -1,
              }
            : { "aria-pressed": on };
        return (
          <button
            key={o.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            onClick={() => onChange(o.key)}
            onKeyDown={(e) => onKey(e, i)}
            className={`pill border ${on ? active : idle}`}
            {...a11y}
          >
            {o.label}
            {o.count !== undefined && <span className="font-mono text-[11px] opacity-80">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
