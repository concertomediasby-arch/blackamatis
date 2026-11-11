"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { layoutTree, popoverPosition, type DiagramEdge } from "@/lib/diagram";
import type { AudioComponent } from "@/lib/types";
import { SpecPopover, POPOVER_W, POPOVER_H } from "./SpecPopover";

export type DiagramNode = {
  key: string;
  title: string;
  sub: string;
  /** Extra line inside the card (e.g. "[__ mm²] · [__ A]"). */
  extra?: string;
  warn?: boolean;
  component: AudioComponent;
};

type Props = {
  label: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  columnLabels: string[];
  /** Labels drawn above straight links, keyed "from>to". */
  edgeLabels?: Record<string, string>;
  /** Dashed line from this node down to a "Chassis Ground" box. */
  groundFrom?: string;
};

export function Diagram({ label, nodes, edges, columnLabels, edgeLabels = {}, groundFrom }: Props) {
  const uid = useId();
  const layout = layoutTree(
    nodes.map((n) => n.key),
    edges,
  );
  const byKey = new Map(layout.nodes.map((n) => [n.key, n]));
  const ground = groundFrom ? byKey.get(groundFrom) : undefined;
  const groundBox = ground ? { x: ground.x, y: ground.y + ground.h + 96, w: ground.w, h: 56 } : null;
  const height = Math.max(layout.height, groundBox ? groundBox.y + groundBox.h + 40 : 0, POPOVER_H + 40);
  const width = layout.width;

  const [open, setOpen] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const popRef = useRef<HTMLDivElement>(null);
  const lastOpened = useRef<string | null>(null);

  const close = useCallback(() => {
    setOpen((cur) => {
      if (cur) cardRefs.current.get(cur)?.focus();
      return null;
    });
  }, []);

  useEffect(() => {
    if (open && open !== lastOpened.current) popRef.current?.focus();
    lastOpened.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const openNode = open ? nodes.find((n) => n.key === open) : undefined;
  const openPlaced = open ? byKey.get(open) : undefined;
  const pos = openPlaced ? popoverPosition(openPlaced, { w: POPOVER_W, h: POPOVER_H }, { width, height }) : null;
  const arrowId = `${uid}-arrow`.replace(/:/g, "");

  return (
    <div>
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[rgba(0,2,49,0.45)]">
        <div className="relative" style={{ width, height }}>
          <svg aria-hidden="true" width={width} height={height} className="absolute inset-0">
            <defs>
              <marker id={arrowId} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 Z" fill="#E5A90A" />
              </marker>
            </defs>
            {layout.edges.map((e) => (
              <path key={`${e.from}>${e.to}`} d={e.path} fill="none" stroke="#E5A90A" strokeWidth="2" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
            ))}
            {ground && groundBox && (
              <path
                d={`M ${ground.x + ground.w / 2} ${ground.y + ground.h} V ${groundBox.y}`}
                stroke="#BFBDC8"
                strokeWidth="2"
                strokeDasharray="6 6"
                fill="none"
              />
            )}
          </svg>

          {columnLabels.slice(0, layout.columns).map((c, i) => (
            <div
              key={c}
              aria-hidden="true"
              className="absolute top-6 text-center font-mono text-[11px] tracking-[0.08em] text-amber"
              style={{ left: layout.options.padX + i * (layout.options.cardW + layout.options.colGap), width: layout.options.cardW }}
            >
              {c}
            </div>
          ))}

          {layout.edges.map((e) => {
            const text = edgeLabels[`${e.from}>${e.to}`];
            if (!text || e.y1 !== e.y2) return null;
            return (
              <div
                key={`l-${e.from}>${e.to}`}
                aria-hidden="true"
                className="absolute text-center font-mono text-[10px] leading-4 tracking-[0.04em] text-muted-2"
                style={{ left: e.x1, width: e.x2 - e.x1, top: e.y1 - 22 }}
              >
                {text}
              </div>
            );
          })}

          {nodes.map((n) => {
            const p = byKey.get(n.key);
            if (!p) return null;
            const on = open === n.key;
            return (
              <button
                key={n.key}
                ref={(el) => {
                  if (el) cardRefs.current.set(n.key, el);
                  else cardRefs.current.delete(n.key);
                }}
                type="button"
                aria-expanded={on}
                aria-controls={on ? `${uid}-pop` : undefined}
                aria-label={`${n.title}, ${n.sub}${n.extra ? `, ${n.extra}` : ""}. Open spec sheet`}
                onClick={() => (on ? close() : setOpen(n.key))}
                className="absolute flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[18px] border px-3 text-center text-ink transition-shadow"
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.w,
                  height: p.h,
                  background: "rgba(0,2,49,0.82)",
                  borderColor: n.warn ? "#FF8A65" : "rgba(229,169,10,0.6)",
                  boxShadow: on ? "0 0 0 3px #E5A90A, 0 10px 30px rgba(0,0,0,0.35)" : "0 10px 30px rgba(0,0,0,0.35)",
                }}
              >
                <span className="font-display text-[22px] font-extrabold leading-none">{n.title}</span>
                <span className="text-[11px] text-muted">{n.sub}</span>
                {n.extra && (
                  <span className={`font-mono text-[10px] tracking-[0.04em] ${n.warn ? "text-[#FFB199]" : "text-amber"}`}>
                    {n.warn && "⚠ "}
                    {n.extra}
                  </span>
                )}
              </button>
            );
          })}

          {groundBox && (
            <div
              className="absolute flex items-center justify-center rounded-[18px] border border-dashed border-white/40 font-mono text-[11px] tracking-[0.1em] text-muted-2"
              style={{ left: groundBox.x, top: groundBox.y, width: groundBox.w, height: groundBox.h }}
            >
              CHASSIS GROUND
            </div>
          )}

          {openNode && pos && (
            <SpecPopover
              ref={popRef}
              id={`${uid}-pop`}
              component={openNode.component}
              style={{ left: pos.left, top: pos.top }}
              onClose={close}
            />
          )}
        </div>
      </div>

      <div className="sr-only">
        <h3>{label} as a list</h3>
        <ul>
          {layout.edges.map((e) => {
            const a = nodes.find((n) => n.key === e.from);
            const b = nodes.find((n) => n.key === e.to);
            const t = edgeLabels[`${e.from}>${e.to}`] ?? b?.extra;
            return (
              <li key={`sr-${e.from}>${e.to}`}>
                {a?.title} to {b?.title}
                {t ? ` (${t})` : ""}
              </li>
            );
          })}
          {ground && <li>{nodes.find((n) => n.key === groundFrom)?.title} to chassis ground</li>}
        </ul>
      </div>
    </div>
  );
}
