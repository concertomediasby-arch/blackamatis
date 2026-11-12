import { Placeholder } from "@/components/ui/Placeholder";
import { instagramHref } from "@/lib/format";
import { normalizeHome } from "@/lib/home";

/** Home: the project statement beside "One car. Two faces." (also the editor's preview). */
export function StatementSection({
  statement,
  children,
}: {
  statement: string | null | undefined;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="statement"
      className="px-8 sm:px-[72px] lg:px-[88px] relative grid grid-cols-1 items-start gap-10 py-28 md:grid-cols-2 md:gap-16"
    >
      {children}
      <div className="flex flex-col gap-4">
        <span className="eyebrow text-amber">Project statement</span>
        <h2
          id="statement"
          className="display m-0 font-extrabold"
          style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
        >
          One car.
          <br />
          Two faces.
        </h2>
      </div>
      <div className="flex flex-col gap-5 text-lg leading-[1.7] text-muted">
        <p className="m-0">{statement}</p>
        <p className="m-0 text-muted-2">
          EMMA judges assess design as a concept and a consistent theme, not
          personal taste. This page is the entry point to the full project
          documentation.
        </p>
      </div>
    </section>
  );
}

/** Home: one "Built by" card for the workshop (name = installer, link = Instagram). Also the editor's preview. */
export function WorkshopCard({
  installer,
  instagram,
  home: raw,
  children,
}: {
  installer: string | null | undefined;
  instagram: string | null | undefined;
  home: unknown;
  children?: React.ReactNode;
}) {
  const home = normalizeHome(raw);
  const workshop = installer?.trim() || "[WORKSHOP NAME]";
  const ig = instagramHref(instagram ?? "");
  return (
    <div className="glass-inset relative flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
      {children}
      <Placeholder
        path={home.workshop_logo}
        label="Logo"
        alt={`${workshop} logo`}
        fit="contain"
        className="h-24 w-24 flex-none rounded-2xl text-[9px]"
        sizes="96px"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <span className="label text-amber">Built by</span>
        <span className="font-display text-[clamp(32px,4vw,44px)] font-extrabold leading-none">
          {workshop}
        </span>
        <span className="text-[15px] leading-relaxed text-muted">
          {home.workshop_line.trim() || "[One line about the workshop.]"}
        </span>
        {ig && (
          <a
            href={ig}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-amber hover:text-lemon"
          >
            Instagram <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
