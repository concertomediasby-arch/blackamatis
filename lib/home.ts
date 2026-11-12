/** Landing-page settings the team edits (editor › Vehicle & Story › Landing page), stored in `vehicle.home`. */
export type HomeSettings = {
  /** Small line above the headline; empty = "EMMA 2026 · <class>". */
  eyebrow: string;
  /** Headline; each line break starts a new line. Empty = "One car.\nTwo faces." */
  title: string;
  /** Short copy under the headline. */
  intro: string;
  /** Button text. */
  cta: string;
  /** Show the vehicle data strip (car, year, category, owner, installer). */
  show_strip: boolean;
};

export const HOME_DEFAULTS = {
  title: "One car.\nTwo faces.",
  intro:
    "A Honda Odyssey built for EMMA 2026. One two-face concept, from the exterior through the interior to the trunk.",
  cta: "Explore the build",
} as const;

export const HOME_LIMITS = {
  eyebrow: 60,
  title: 60,
  intro: 240,
  cta: 30,
} as const;

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.slice(0, max) : "";

/** Accepts anything from the database and returns safe settings (empty text = use the default). */
export function normalizeHome(v: unknown): HomeSettings {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    eyebrow: str(o.eyebrow, HOME_LIMITS.eyebrow),
    title: str(o.title, HOME_LIMITS.title),
    intro: str(o.intro, HOME_LIMITS.intro),
    cta: str(o.cta, HOME_LIMITS.cta),
    show_strip: o.show_strip !== false,
  };
}

/** The text the hero shows: the team's text, or the default where a field is empty. */
export function heroText(v: unknown, className: string) {
  const h = normalizeHome(v);
  const lines = (h.title.trim() || HOME_DEFAULTS.title)
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    eyebrow: h.eyebrow.trim() || `EMMA 2026 · ${className}`,
    titleLines: lines,
    intro: h.intro.trim() || HOME_DEFAULTS.intro,
    cta: h.cta.trim() || HOME_DEFAULTS.cta,
    showStrip: h.show_strip,
  };
}

/** "Expert Unlimited" when the category only repeats the class name, else "CATEGORY · Class". */
export function categoryLabel(
  category: string | null | undefined,
  className: string,
) {
  const c = (category ?? "").trim();
  if (!c || c.toLowerCase() === className.toLowerCase()) return className;
  return `${c} · ${className}`;
}
