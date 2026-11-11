import type { ComponentType, SpecRow } from "./types";

/** Spec fields per component type (CLAUDE.md › Spec popover). */
export const SPEC_FIELDS: Record<ComponentType, string[]> = {
  head_unit: ["Type", "Outputs", "Digital output", "Screen / control", "Power fuse", "Mounting location"],
  dsp: ["Inputs", "Outputs", "Sample rate", "Control", "Power fuse", "Mounting location"],
  amplifier: ["Channels", "RMS @ 4Ω", "RMS @ 2Ω", "Class", "Power cable", "Fuse", "Mounting location"],
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
  main_fuse: ["Fuse type", "Rating", "Distance to + post", "Cable size", "Cover"],
  distribution: ["Inputs", "Outputs", "Fuse ratings", "Cable sizes", "Location"],
};

export const TYPE_LABELS: Record<ComponentType, string> = {
  head_unit: "Head unit",
  dsp: "DSP",
  amplifier: "Amplifier",
  speaker: "Speaker / sub",
  battery: "Battery",
  main_fuse: "Main fuse",
  distribution: "Distribution",
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

/** Merge stored specs with the template for a type so every field is present, in order. */
export function specRows(type: ComponentType, stored: SpecRow[] = []): SpecRow[] {
  return SPEC_FIELDS[type].map((k) => {
    const v = stored.find((s) => s.k === k)?.v?.trim();
    return { k, v: v ? v : placeholderFor(k) };
  });
}
