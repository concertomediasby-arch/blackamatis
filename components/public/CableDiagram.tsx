"use client";

/* eslint-disable @next/next/no-img-element -- static export; the image keeps its own aspect ratio */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  clickAreas,
  inside,
  pathMarks,
  type PathMark,
} from "@/lib/circuit-path";
import { circuitSheet } from "@/lib/circuit-sheet";
import { normalizeCircuit } from "@/lib/circuits";
import type { AudioComponent, Circuit } from "@/lib/types";
import { CircuitSheet } from "./CircuitSheet";
import { SpecPopover } from "./SpecPopover";

/** At this container width the panel sits beside the diagram; below it, it opens as a sheet from the bottom. */
const SIDE_MIN_WIDTH = 980;
/** Below this width the diagram is too small for name tags: only the outlines show (names are in the circuit card). */
const TAG_MIN_WIDTH = 640;

const DOT = {
  ok: "bg-lemon",
  over: "bg-white/40",
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
  // Phones: show the lit path on the diagram first, with a small bar; the sheet opens on demand.
  const [peek, setPeek] = useState(true);
  const side = width >= SIDE_MIN_WIDTH;
  const active = circuits.find((c) => c.id === open) ?? null;
  const product = components.find((x) => x.key === active?.component_key);
  const marks = active ? pathMarks(active, circuits) : [];
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
    setPeek(true);
    setOpen(id);
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, specs, peek, close]);

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
      <div className="flex min-w-0 flex-col gap-2">
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <img src={imageUrl} alt={alt} className="block h-auto w-full" />
          </div>
          {marks.length > 0 && (
            <PathOverlay
              marks={marks}
              maskId={`${uid}-mask`}
              tags={width >= TAG_MIN_WIDTH}
            />
          )}
          {clickAreas(circuits).map(({ circuit: c, box: s, key }, i, all) => {
            const on = open === c.id;
            const first = all.findIndex((x) => x.circuit.id === c.id) === i;
            return (
              <button
                key={key}
                ref={(el) => {
                  if (el && first) btnRefs.current.set(c.id, el);
                }}
                type="button"
                aria-expanded={on}
                aria-controls={`${uid}-panel`}
                aria-label={`${c.fuse_code ? `${c.fuse_code} · ` : ""}${c.name}. Open circuit: power, ground, cables and fuses`}
                title={c.fuse_code ? `${c.fuse_code} · ${c.name}` : c.name}
                onClick={() => (on ? close() : pick(c.id))}
                className="absolute cursor-pointer rounded-md bg-transparent"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.w}%`,
                  height: `${s.h}%`,
                }}
              />
            );
          })}
        </div>
        {marks.length > 0 && (
          <p className="m-0 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 font-mono text-[10px] tracking-[0.08em] text-muted-2">
            <span className="text-ink">
              PATH OF {active?.name.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-4 rounded-sm border-2 border-amber"
              />
              + POWER RUN
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-4 rounded-sm border-2 border-dashed border-white"
              />
              − GROUND RUN
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-4 rounded-sm border-[3px] border-lemon"
              />
              DEVICE
            </span>
          </p>
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
      ) : active && peek ? (
        <div
          id={`${uid}-panel`}
          ref={panelRef}
          tabIndex={-1}
          role="region"
          aria-label={`Path of ${active.name} on the diagram`}
          className="fixed inset-x-2 bottom-2 z-50 mx-auto flex max-w-[640px] items-center gap-3 rounded-2xl border border-amber/40 px-4 py-2 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
          style={{ background: "rgba(1,20,53,0.96)" }}
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-mono text-[10px] tracking-[0.14em] text-amber">
              {active.fuse_code
                ? `CIRCUIT ${active.fuse_code}`
                : active.kind === "trunk"
                  ? "MAIN RUN"
                  : "CIRCUIT"}{" "}
              · PATH LIT UP
            </span>
            <span className="truncate text-[15px] font-semibold">
              {active.name}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setPeek(false)}
            className="pill min-h-11 flex-none bg-amber px-4 text-[13px] text-prussian"
          >
            Details ↑
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close circuit"
            className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
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
            {marks.length > 0 && (
              <button
                type="button"
                onClick={() => setPeek(true)}
                className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-full border border-amber/50 px-4 text-[13px] font-semibold text-amber hover:bg-white/5"
              >
                ↓ Show the path on the diagram
              </button>
            )}
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

const MARK_STYLE: Record<
  PathMark["kind"],
  { ring: string; tag: string; sign: string }
> = {
  device: {
    ring: "border-[3px] border-lemon",
    tag: "bg-lemon text-prussian",
    sign: "",
  },
  power: {
    ring: "border-2 border-amber",
    tag: "bg-amber text-prussian",
    sign: "+ ",
  },
  both: {
    ring: "border-2 border-amber",
    tag: "bg-amber text-prussian",
    sign: "± ",
  },
  ground: {
    ring: "border-2 border-dashed border-white",
    tag: "bg-white text-prussian",
    sign: "− ",
  },
};

/**
 * Where each name tag goes: above its box, or below when the box sits inside
 * a bigger marked part (a fuse holder on the distribution block) or at the top
 * edge. Tags that would overlap a neighbour's move one line further out.
 */
function placeTags(marks: PathMark[]) {
  // Rough tag width in % of the diagram width (monospace ~0.62% per character at ~1000 px).
  const half = (m: PathMark) => (m.label.length + 2) * 0.31 + 0.6;
  const cx = (m: PathMark) => m.x + m.w / 2;
  const placed = marks.map((m) => ({
    m,
    below: m.y < 6 || marks.some((o) => inside(m, o)),
    level: 0,
  }));
  const edge = (t: (typeof placed)[number]) =>
    t.below ? t.m.y + t.m.h : t.m.y;
  [...placed]
    .sort((a, b) => cx(a.m) - cx(b.m))
    .forEach((t, i, sorted) => {
      const taken = new Set(
        sorted
          .slice(0, i)
          .filter(
            (o) =>
              o.below === t.below &&
              Math.abs(edge(o) - edge(t)) < 4 &&
              Math.abs(cx(o.m) - cx(t.m)) < half(o.m) + half(t.m),
          )
          .map((o) => o.level),
      );
      while (taken.has(t.level)) t.level++;
    });
  return placed;
}

/**
 * The selected circuit's path on the cable diagram: everything else is dimmed
 * and each part it runs through (main run, distribution, fuse holder, ground
 * block, the device) is outlined with its name. Purely visual: the clickable
 * areas sit on top of it.
 */
function PathOverlay({
  marks,
  maskId,
  tags,
}: {
  marks: PathMark[];
  maskId: string;
  tags: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 motion-safe:animate-[fadeIn_200ms_ease-out]"
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-hidden rounded-3xl"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100" height="100" fill="white" />
            {marks.map((m) => (
              <rect
                key={m.key}
                x={m.x - 0.3}
                y={m.y - 0.5}
                width={m.w + 0.6}
                height={m.h + 1}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="rgba(0,2,49,0.62)"
          mask={`url(#${maskId})`}
        />
      </svg>
      {placeTags(marks).map(({ m, below, level }) => {
        const st = MARK_STYLE[m.kind];
        // No sign when the name already says it (Battery +).
        const sign = /[+−-]\s*$/.test(m.label) ? "" : st.sign;
        const shift = `${level * 18}px`;
        return (
          <div
            key={m.key}
            className={`absolute rounded-md ${st.ring} shadow-[0_0_0_1px_rgba(0,0,0,0.35)]`}
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: `${m.w}%`,
              height: `${m.h}%`,
            }}
          >
            {tags && (
              <span
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-px font-mono text-[9px] font-semibold leading-[14px] tracking-[0.04em] shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-[10px] ${st.tag} ${
                  below ? "top-full mt-1" : "bottom-full mb-1"
                }`}
                style={
                  below
                    ? { marginTop: `calc(4px + ${shift})` }
                    : { marginBottom: `calc(4px + ${shift})` }
                }
              >
                {sign}
                {m.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
