"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A piece of the public site drawn at a real screen width (default 1440 px),
 * scaled down to fit the editor card, so the team sees it as visitors will.
 * Not interactive: it only shows.
 */
export function ScaledPreview({
  label,
  children,
  width = 1440,
  tone = "dark",
  note,
  interactive = false,
}: {
  label: string;
  children: React.ReactNode;
  /** The screen width the piece is drawn at, px. */
  width?: number;
  /** Page background behind the piece. */
  tone?: "dark" | "light";
  /** Small line above the preview; defaults to "Preview · as on the site". */
  note?: string;
  /** Let the team click inside the preview (tabs, rows); off by default. */
  interactive?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(300);
  useEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;
    const ro = new ResizeObserver(() => {
      const s = Math.min(1, box.clientWidth / width);
      setScale(s);
      setHeight(inner.offsetHeight * s);
    });
    ro.observe(box);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#55535c]">
        {note ?? "Preview · as on the site"}
      </span>
      <div
        ref={boxRef}
        aria-label={label}
        className={`overflow-hidden rounded-xl ${tone === "dark" ? "bg-prussian text-ink" : "bg-lemon text-black"}`}
        style={{ height }}
      >
        <div
          ref={innerRef}
          style={{
            width,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className={interactive ? undefined : "pointer-events-none"}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
