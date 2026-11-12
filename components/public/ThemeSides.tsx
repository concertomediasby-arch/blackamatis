import { GlassPanel } from "@/components/ui/GlassPanel";
import { Placeholder } from "@/components/ui/Placeholder";
import { EditPencil } from "@/components/public/EditMode";
import type { ThemeLayout } from "@/lib/page-layout";
import { heroTransform, type HeroLayout } from "@/lib/photo";
import { normalizePoints } from "@/lib/theme";
import type { Vehicle } from "@/lib/types";

/** Photo height in the two side cards (editor › Page layouts › Theme). */
const PHOTO_ASPECT: Record<ThemeLayout["photo"], string> = {
  large: "aspect-[16/10]",
  medium: "aspect-[16/9]",
  short: "aspect-[21/9]",
};

/** Short points under a side's description. */
function SidePoints({
  points,
  tone,
}: {
  points: string[];
  tone: "dark" | "light";
}) {
  if (points.length === 0) return null;
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {points.map((p, i) => (
        <li
          key={i}
          className={`flex gap-3 text-[15px] leading-snug ${tone === "dark" ? "text-ink" : "text-black"}`}
        >
          <span
            aria-hidden="true"
            className={`mt-[7px] h-1.5 w-1.5 flex-none rounded-full ${tone === "dark" ? "bg-amber" : "bg-navy"}`}
          />
          {p}
        </li>
      ))}
    </ul>
  );
}

/** A side's photo in its frame, moved and scaled by the team's position & size (crop focus still applies). */
function SidePhoto({
  path,
  label,
  alt,
  tone = "dark",
  frame,
  place,
}: {
  path: string | null;
  label: string;
  alt: string;
  tone?: "dark" | "light";
  frame: string;
  place: HeroLayout;
}) {
  if (!path)
    return (
      <Placeholder
        path={null}
        label={label}
        alt={alt}
        tone={tone}
        className={`${frame} w-full rounded-[24px] border`}
      />
    );
  return (
    <div
      className={`${frame} relative w-full overflow-hidden rounded-[24px] border`}
    >
      <div
        className="absolute inset-0"
        style={{ transform: heroTransform(place) }}
      >
        <Placeholder
          path={path}
          label={label}
          alt={alt}
          tone={tone}
          className="h-full w-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}

/**
 * The two-face cards at the top of the Theme page (dark side, light side).
 * Page margin, space between the cards, card padding, headline size, photo
 * height and each photo's position & size come from the team's Theme layout.
 */
export function ThemeSides({ v, layout }: { v: Vehicle; layout: ThemeLayout }) {
  const k = layout.headline / 100;
  const headline = {
    fontSize: `clamp(${64 * k}px, ${8 * k}vw, ${120 * k}px)`,
    lineHeight: layout.leading / 100,
    letterSpacing: `${layout.tracking / 100}em`,
  };
  return (
    <section
      aria-labelledby="two-face"
      style={
        {
          "--tm": `${layout.margin}px`,
          "--tg": `${layout.gap}px`,
          "--tp": `${layout.padding}px`,
          "--th": `${layout.spacing}px`,
        } as React.CSSProperties
      }
      className="grid grid-cols-1 gap-[var(--tg)] px-3 pt-8 sm:px-6 md:grid-cols-2 md:px-[var(--tm)]"
    >
      <GlassPanel className="relative flex flex-col gap-8 rounded-[36px] px-6 py-12 sm:px-[var(--tp)] sm:py-[calc(var(--tp)*1.333)]">
        <EditPencil
          href="/editor/vehicle/#faces"
          label="Dark side"
          className="right-5 top-5"
        />
        <span className="eyebrow text-amber">02 — Theme</span>
        <div className="flex flex-col gap-[var(--th)]">
          <span className="label text-amber">{v.dark_side_name}</span>
          <h1 id="two-face" className="display m-0 font-black" style={headline}>
            TWO
            <br />
            FACE
          </h1>
          <p className="m-0 max-w-[460px] text-[17px] leading-[1.7] text-muted">
            {v.dark_side_body}
          </p>
          <SidePoints
            points={normalizePoints(v.dark_side_points)}
            tone="dark"
          />
        </div>
        <SidePhoto
          path={v.dark_side_photo_path ?? null}
          label="Dark side photo"
          alt={`${v.dark_side_name}: the dark side of Black Amatis`}
          frame={`${PHOTO_ASPECT[layout.photo]} border-white/10`}
          place={layout.dark_photo}
        />
      </GlassPanel>
      <GlassPanel
        tone="light"
        className="relative flex flex-col justify-between gap-8 rounded-[36px] px-6 py-12 sm:px-[var(--tp)] sm:py-[calc(var(--tp)*1.333)]"
      >
        <EditPencil
          href="/editor/vehicle/#faces"
          label="Light side"
          className="right-5 top-5"
          tone="light"
        />
        <div className="flex flex-col gap-[var(--th)]">
          <span className="label text-navy">{v.light_side_name}</span>
          <span
            aria-hidden="true"
            className="display font-black"
            style={headline}
          >
            BLACK
            <br />
            AMATIS
          </span>
          <p className="m-0 max-w-[460px] text-[17px] leading-[1.7] text-dark-muted">
            {v.light_side_body}
          </p>
          <SidePoints
            points={normalizePoints(v.light_side_points)}
            tone="light"
          />
        </div>
        <SidePhoto
          path={v.light_side_photo_path ?? null}
          label="Light side photo"
          alt={`${v.light_side_name}: the light side of Black Amatis`}
          tone="light"
          frame={`${PHOTO_ASPECT[layout.photo]} border-black/15`}
          place={layout.light_photo}
        />
      </GlassPanel>
    </section>
  );
}
