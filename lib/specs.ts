import type { ComponentType, SpecRow } from "./types";

/** Spec fields per component type (CLAUDE.md › Spec popover). */
export const SPEC_FIELDS: Record<ComponentType, string[]> = {
  head_unit: [
    "Type",
    "Outputs",
    "Digital output",
    "Screen / control",
    "Power fuse",
    "Mounting location",
  ],
  dsp: [
    "Inputs",
    "Outputs",
    "Sample rate",
    "Control",
    "Power fuse",
    "Mounting location",
  ],
  amplifier: [
    "Channels",
    "RMS @ 4Ω",
    "RMS @ 2Ω",
    "Class",
    "Power cable",
    "Fuse",
    "Mounting location",
  ],
  speaker: [
    "Size",
    "Impedance",
    "RMS power",
    "Sensitivity",
    "Frequency response",
    "Mounting location",
    "Driven by",
  ],
  battery: ["Type", "Capacity (Ah)", "CCA", "Location", "Positive cable"],
  main_fuse: [
    "Fuse type",
    "Rating",
    "Distance to + post",
    "Cable size",
    "Cover",
  ],
  distribution: [
    "Inputs",
    "Outputs",
    "Fuse ratings",
    "Cable sizes",
    "Location",
  ],
  capacitor: ["Type", "Capacity", "Voltage", "Fuse", "Mounting location"],
  // Free form: devices like a music SSD, relay or LED strip share no fields,
  // so the editor adds its own rows (see customSpecs).
  other: [],
};

export const TYPE_LABELS: Record<ComponentType, string> = {
  head_unit: "Head unit",
  dsp: "DSP",
  amplifier: "Amplifier",
  speaker: "Speaker / sub",
  battery: "Battery",
  main_fuse: "Main fuse",
  distribution: "Distribution",
  capacitor: "Capacitor / power bank",
  other: "Other (relay, LED, …)",
};

const UNIT_PLACEHOLDERS: Record<string, string> = {
  "Power fuse": "[__ A]",
  Fuse: "[__ A]",
  Rating: "[__ A]",
  "Power cable": "[__ mm²]",
  "Positive cable": "[__ mm²]",
  "Cable size": "[__ mm²]",
  "Cable sizes": "[__ mm²]",
  "Fuse ratings": "[__ A each]",
  "Capacity (Ah)": "[__ Ah]",
  "Distance to + post": "[__ cm]",
};

export function placeholderFor(field: string): string {
  return UNIT_PLACEHOLDERS[field] ?? "[—]";
}

/** Stored rows that are not one of the type's standard fields, in their saved order. */
export function customSpecs(
  type: ComponentType,
  stored: SpecRow[] = [],
): SpecRow[] {
  const fixed = SPEC_FIELDS[type];
  return stored.filter((s) => !fixed.includes(s.k));
}

/**
 * Rows left out of the spec popover in the System diagram (signal flow): fuse
 * and mounting details belong to the cable diagram (team decision). The cable
 * diagram and the editor still show them.
 */
export const SYSTEM_DIAGRAM_HIDDEN_SPECS: readonly string[] = [
  "Power fuse",
  "Fuse",
  "Mounting location",
];

/**
 * Rows for the spec popover: the type's standard fields in order (placeholder
 * when empty), then the editor's own rows. Own rows without a label are skipped,
 * and so are rows whose label is in `omit` (compared case-insensitively).
 */
export function specRows(
  type: ComponentType,
  stored: SpecRow[] = [],
  omit: readonly string[] = [],
): SpecRow[] {
  const hidden = new Set(omit.map((k) => k.trim().toLowerCase()));
  const keep = (k: string) => !hidden.has(k.trim().toLowerCase());
  const fixed = SPEC_FIELDS[type].filter(keep).map((k) => {
    const v = stored.find((s) => s.k === k)?.v?.trim();
    return { k, v: v ? v : placeholderFor(k) };
  });
  const own = customSpecs(type, stored)
    .map((s) => ({ k: s.k.trim(), v: s.v?.trim() ?? "" }))
    .filter((s) => s.k && keep(s.k))
    .map((s) => ({ k: s.k, v: s.v || placeholderFor(s.k) }));
  return [...fixed, ...own];
}
