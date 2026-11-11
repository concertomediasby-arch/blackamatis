"use client";

/* eslint-disable @next/next/no-img-element -- static export; the image keeps its own aspect ratio */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { circuitSheet } from "@/lib/circuit-sheet";
import { normalizeCircuit } from "@/lib/circuits";
import type { AudioComponent, Circuit } from "@/lib/types";
import { CircuitSheet } from "./CircuitSheet";
import { SpecPopover } from "./SpecPopover";

/** At this container width the panel sits beside the diagram; below it, it opens as a sheet from the bottom. */
const SIDE_MIN_WIDTH = 980;

const DOT = {
  ok: "bg-lemon",
  over: "bg-[#FF8A65]",
  incomplete: "bg-white/40",
  empty: "bg-white/20",
} as const;

/**
 * The team's cable diagram with a circuit panel: beside the diagram on wide
 * screens, as a bottom sheet on phones. Before anything is picked the panel
 * lists every circuit by fuse code, so judges can go through all fuses quickly.
 */
export function CableDiagram({
  imageUrl,
  alt,
  circuits: rows,
  components,
}: {
  imageUrl: string;
  alt: string;
  circuits: Circuit[];
  components: AudioComponent[];
}) {
  const circuits = rows.map(normalizeCircuit).sort((a, b) => a.sort - b.sort);
  const uid = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef(new Map<string, HTMLButtonElement>());
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [specs, setSpecs] = useState(false);
  const side = width >= SIDE_MIN_WIDTH;
  const active = circuits.find((c) => c.id === open) ?? null;
  const product = components.find((x) => x.key === active?.component_key);
  const title = (k: string | null | undefined) =>
    components.find((x) => x.key === k)?.title;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const close = useCallback(() => {
    setSpecs(false);
    setOpen((cur) => {
      if (cur) btnRefs.current.get(cur)?.focus();
      return null;
    });
  }, []);

  const pick = (id: string) => {
    setSpecs(false);
    setOpen(id);
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, specs, close]);

  const groups = [
    {
      title: "Fuse block A",
      list: circuits.filter(
        (c) => c.kind === "channel" && /^A/i.test(c.fuse_code ?? ""),
      ),
    },
    {
      title: "Fuse block B",
      list: circuits.filter(
        (c) => c.kind === "channel" && /^B/i.test(c.fuse_code ?? ""),
      ),
    },
    { title: "Main runs", list: circuits.filter((c) => c.kind === "trunk") },
    {
      title: "Other",
      list: circuits.filter(
        (c) => c.kind === "channel" && !/^[AB]/i.test(c.fuse_code ?? ""),
      ),
    },
  ].filter((g) => g.list.length);
  const codeSort = (a: Circuit, b: Circuit) =>
    (a.fuse_code ?? "").localeCompare(b.fuse_code ?? "", undefined, {
      numeric: true,
    });

  const index = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-[0.14em] text-amber">
          ALL CIRCUITS
        </span>
        <span className="text-[13px] text-muted">
          Click a device on the diagram, or pick a circuit by its fuse.
        </span>
      </div>
      {groups.map((g) => (
        <div key={g.title} className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-2">
            {g.title.toUpperCase()}
          </span>
          <ul className="m-0 grid list-none grid-cols-1 gap-1 p-0">
            {[...g.list].sort(codeSort).map((c) => {
              const st = circuitSheet(c, circuits, title).status;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => pick(c.id)}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[13px] hover:bg-white/[0.06]"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 flex-none rounded-full ${DOT[st]}`}
                    />
                    {c.fuse_code && (
                      <span className="w-14 flex-none font-mono text-[12px] text-amber">
                        {c.fuse_code}
                      </span>
                    )}
                    <span className="flex-1">{c.name}</span>
                    {st === "over" && (
                      <span className="font-mono text-[11px] text-[#FFB199]">
                        ⚠
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.06em] text-muted-2">
        <span>
          <span
            className={`mr-1.5 inline-block h-2 w-2 rounded-full ${DOT.ok}`}
          />
          FUSES OK
        </span>
        <span>
          <span
            className={`mr-1.5 inline-block h-2 w-2 rounded-full ${DOT.over}`}
          />
          CHECK
        </span>
        <span>
          <span
            className={`mr-1.5 inline-block h-2 w-2 rounded-full ${DOT.incomplete}`}
          />
          NOT FILLED IN
        </span>
      </p>
    </div>
  );

  const nav = (back: string, onBack: () => void) => (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 cursor-pointer items-center text-[13px] font-semibold text-amber hover:text-lemon"
      >
        {back}
      </button>
      <button
        type="button"
        onClick={close}
        aria-label="Close circuit"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );

  const detail =
    active &&
    (specs && product ? (
      <div className="flex flex-col gap-3 pt-4">
        {nav("← Circuit", () => setSpecs(false))}
        <SpecPopover
          id={`${uid}-spec`}
          component={product}
          style={{}}
          inline
          onClose={close}
        />
      </div>
    ) : (
      <CircuitSheet
        key={active.id}
        circuit={active}
        circuits={circuits}
        components={components}
        titleId={`${uid}-title`}
        onShowSpecs={product ? () => setSpecs(true) : undefined}
        nav={nav("← All circuits", close)}
      />
    ));

  const panelCls =
    "flex flex-col overflow-y-auto rounded-3xl border border-amber/40 px-5 pb-5 pt-0 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.45)] [scrollbar-color:rgba(229,169,10,0.5)_transparent] [scrollbar-width:thin]";

  return (
    <div
      ref={wrapRef}
      className={
        side
          ? "grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5"
          : "flex flex-col gap-4"
      }
    >
      <div className="relative">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <img src={imageUrl} alt={alt} className="block h-auto w-full" />
        </div>
        {circuits.flatMap((c) =>
          c.wiring_hotspots.map((s, i) => {
            const on = open === c.id;
            const key = `${c.id}-${i}`;
            return (
              <button
                key={key}
                ref={(el) => {
                  if (el && i === 0) btnRefs.current.set(c.id, el);
                }}
                type="button"
                aria-expanded={on}
                aria-controls={`${uid}-panel`}
                aria-label={`${c.fuse_code ? `${c.fuse_code} · ` : ""}${c.name}. Open circuit: power, ground, cables and fuses`}
                title={c.fuse_code ? `${c.fuse_code} · ${c.name}` : c.name}
                onClick={() => (on ? close() : pick(c.id))}
                // Thin outline only on the selected device; nothing on hover.
                className={`absolute cursor-pointer rounded-lg bg-transparent ${on ? "outline outline-2 outline-offset-2 outline-amber/90" : ""}`}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.w}%`,
                  height: `${s.h}%`,
                }}
              />
            );
          }),
        )}
      </div>

      {side ? (
        <aside
          id={`${uid}-panel`}
          ref={panelRef}
          tabIndex={-1}
          aria-label={active ? `Circuit ${active.name}` : "All circuits"}
          className={`${panelCls} sticky top-24 max-h-[calc(100vh-7rem)]`}
          style={{ background: "rgba(1,20,53,0.92)" }}
        >
          {detail || <div className="pt-5">{index}</div>}
        </aside>
      ) : active ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-2">
          <button
            type="button"
            aria-label="Close circuit"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/55"
          />
          <div
            id={`${uid}-panel`}
            ref={panelRef}
            role="dialog"
            aria-labelledby={`${uid}-title`}
            tabIndex={-1}
            className={`${panelCls} relative max-h-[78vh] w-full max-w-[640px] rounded-b-none`}
            style={{ background: "#011435" }}
          >
            <span
              aria-hidden="true"
              className="mx-auto mb-1 mt-2 h-1 w-10 flex-none rounded-full bg-white/30"
            />
            {detail}
          </div>
        </div>
      ) : (
        <details
          className="rounded-3xl border border-white/10 p-4 text-ink"
          style={{ background: "rgba(1,20,53,0.6)" }}
        >
          <summary className="min-h-11 cursor-pointer content-center text-[13px] font-semibold text-amber">
            All circuits by fuse
          </summary>
          <div className="pt-3">{index}</div>
        </details>
      )}
    </div>
  );
}
