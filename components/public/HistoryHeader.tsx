import {
  normalizeHistoryLayout,
  type HistoryLayout,
} from "@/lib/history-layout";

/**
 * History headline and story, placed by the team's layout settings. Phones
 * always stack them with a fixed margin; from tablet width the settings apply.
 */
export function HistoryHeader({
  story,
  layout,
  children,
}: {
  story: string | null | undefined;
  layout: unknown;
  children?: React.ReactNode;
}) {
  const l: HistoryLayout = normalizeHistoryLayout(layout);
  const beside = l.story === "beside";
  const vars = {
    "--hm": `${l.margin}px`,
    "--hg": `${l.gap}px`,
    "--sw": `${l.width}px`,
  } as React.CSSProperties;
  const grid = beside
    ? `md:grid-cols-[auto_minmax(0,var(--sw))] ${l.align === "center" ? "md:justify-center" : l.align === "spread" ? "md:justify-between" : "md:justify-start"} ${l.valign === "start" ? "md:items-start" : "md:items-end"}`
    : `${l.align === "center" ? "md:justify-items-center md:text-center" : "md:justify-items-start"}`;
  const paragraphs = (story ?? "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <section
      style={vars}
      className={`relative grid grid-cols-1 gap-8 px-5 pb-16 pt-24 md:gap-[var(--hg)] md:px-[var(--hm)] ${grid}`}
    >
      {children}
      <div className="flex flex-col gap-4">
        <span className="eyebrow text-amber">01 — History</span>
        <h1
          className="display m-0 font-black"
          style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}
        >
          From stock
          <br />
          to the stage.
        </h1>
      </div>
      {/* Each line or blank-line-separated block of the story is its own paragraph. */}
      <div className="flex w-full max-w-[var(--sw)] flex-col gap-4 text-lg leading-[1.7] text-muted">
        {paragraphs.map((p, i) => (
          <p key={i} className="m-0">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
