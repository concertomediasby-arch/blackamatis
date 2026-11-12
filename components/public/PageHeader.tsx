import { headlineCss, type PageKey, type PageLayout } from "@/lib/page-layout";

/** Eyebrow, headline lines and intro text of each page that has a headline header. */
export const PAGE_COPY: Record<
  PageKey,
  { name: string; eyebrow: string; title: [string, string]; intro?: string }
> = {
  history: {
    name: "History",
    eyebrow: "01 — History",
    title: ["From stock", "to the stage."],
  },
  installation: {
    name: "Installation",
    eyebrow: "03 — Installation",
    title: ["Behind", "the panels."],
    intro:
      "Signal flow, power and fuses, and photo evidence for every judge book criterion. Click any product in a diagram to see its spec sheet.",
  },
  bonus: {
    name: "Bonus Point",
    eyebrow: "04 — Bonus Point",
    title: ["More than", "just an install."],
    intro:
      "Our bonus requests cover the whole car: glass, lights, rims, body, cabin and trunk. Each request is worth up to 3 points: 1 for the idea, plus 1 for average or 2 for good execution.",
  },
  judge: {
    name: "Judge Mode",
    eyebrow: "05 — Judge Mode",
    title: ["Every criterion.", "Every proof."],
    intro:
      "A quick reference for the judges. Each criterion from the EMMA Install Judge Book 2026 is linked to the evidence for Black Amethyst, so it can be checked without removing a single panel.",
  },
};

/**
 * A page's headline and intro text, placed by the team's layout settings.
 * Phones always stack them with a fixed margin; from tablet width the
 * settings apply. `text` replaces the fixed intro (History: the story).
 */
export function PageHeader({
  page,
  layout: l,
  text,
  bottom = 64,
  children,
}: {
  page: PageKey;
  layout: PageLayout;
  text?: string | null;
  /** Space under the header, px (History: up to its slider). */
  bottom?: number;
  children?: React.ReactNode;
}) {
  const copy = PAGE_COPY[page];
  const beside = l.story === "beside";
  const vars = {
    "--hm": `${l.margin}px`,
    "--hg": `${l.gap}px`,
    "--sw": `${l.width}px`,
    "--hs": `${l.spacing}px`,
    "--hb": `${bottom}px`,
  } as React.CSSProperties;
  const grid = beside
    ? `md:grid-cols-[auto_minmax(0,var(--sw))] ${l.align === "center" ? "md:justify-center" : l.align === "spread" ? "md:justify-between" : "md:justify-start"} ${l.valign === "start" ? "md:items-start" : "md:items-end"}`
    : `${l.align === "center" ? "md:justify-items-center md:text-center" : "md:justify-items-start"}`;
  // Each line or blank-line-separated block is its own paragraph.
  const paragraphs = (text ?? copy.intro ?? "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <section
      style={vars}
      className={`relative grid grid-cols-1 gap-8 px-5 pt-24 pb-[var(--hb)] md:gap-[var(--hg)] md:px-[var(--hm)] ${grid}`}
    >
      {children}
      <div className="flex flex-col gap-[var(--hs)]">
        <span className="eyebrow text-amber">{copy.eyebrow}</span>
        <h1
          className="display m-0 font-black"
          style={headlineCss(l, 64, (k) => `${9 * k}vw`, 128)}
        >
          {copy.title[0]}
          <br />
          {copy.title[1]}
        </h1>
      </div>
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
