import type { Hotspot } from "../photo";
import type { AudioComponent, ComponentType } from "../types";

export const ROLE_BY_TYPE: Record<ComponentType, string> = {
  head_unit: "SOURCE",
  dsp: "PROCESSING",
  amplifier: "AMPLIFICATION",
  speaker: "SPEAKERS",
  battery: "POWER SOURCE",
  main_fuse: "PROTECTION",
  distribution: "DISTRIBUTION",
};

/** Diagram key from a title, unique among existing keys: "Amplifier STEG" -> "amplifier_steg", "amplifier_steg_2". */
export function uniqueKey(title: string, existing: readonly string[]): string {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "component";
  if (!existing.includes(base)) return base;
  let i = 2;
  while (existing.includes(`${base}_${i}`)) i++;
  return `${base}_${i}`;
}

/** A new, empty component (not yet in either diagram). */
export function newComponent(opts: { title: string; type: ComponentType; existing: readonly AudioComponent[]; hotspots?: Hotspot[] }): AudioComponent {
  const { title, type, existing } = opts;
  return {
    id: `new-${crypto.randomUUID()}`,
    key: uniqueKey(title, existing.map((c) => c.key)),
    title: title.trim() || "New component",
    role: ROLE_BY_TYPE[type],
    type,
    brand: "",
    model: "",
    specs: [],
    note: "",
    photo_path: null,
    pdf_path: null,
    in_system: false,
    in_wiring: false,
    fed_by: null,
    hotspots: opts.hotspots ?? [],
    sort: existing.length + 1,
  };
}
