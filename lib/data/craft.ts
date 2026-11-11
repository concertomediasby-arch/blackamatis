import type { CraftCategory } from "../types";

/** "What to look at" checklist per craftsmanship category (guidance for judges and the team). */
export const CRAFT_CHECKLIST: Record<CraftCategory, string[]> = {
  wiring: ["Looms, sleeving and fastening are consistent", "Strain relief at every termination", "Clean routing, signal and power kept apart"],
  hu: ["Panel fit around the screen", "Equal gaps and clean edges", "Integrated into the dashboard lines"],
  amps: ["Precise mounting and even spacing", "Terminals reachable for service", "Clean edges and joints on cover panels"],
  spk: ["Symmetry left and right", "Grilles aligned and rigid", "Smooth transitions between materials"],
  other: ["Every component integrated into the car", "Attention to detail in hidden areas too", "Evidence of planning and professional execution"],
};
