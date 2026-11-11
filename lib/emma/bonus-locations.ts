/**
 * Bonus request groups and the location catalogue (61 spots) used by the
 * editor's "New request" picker. Bonus requests cover the whole car.
 */

export const BONUS_GROUPS = [
  { key: "glass", label: "Glass", prefix: "G" },
  { key: "lights", label: "Lights", prefix: "L" },
  { key: "rims", label: "Rims & Wheels", prefix: "R" },
  { key: "body", label: "Body", prefix: "B" },
  { key: "interior", label: "Interior", prefix: "I" },
  { key: "trunk", label: "Trunk & Audio", prefix: "T" },
  { key: "new", label: "New", prefix: "N" },
] as const;
export type BonusGroup = (typeof BONUS_GROUPS)[number]["key"];

export const BONUS_LOCATIONS: Record<Exclude<BonusGroup, "new">, readonly string[]> = {
  glass: [
    "Windshield",
    "Windshield top strip",
    "Front door windows",
    "Rear door windows",
    "Rear quarter glass",
    "Tailgate glass",
    "Sunroof / roof glass",
    "Mirror glass",
  ],
  lights: [
    "Headlights",
    "Daytime running lights",
    "Front fog lights",
    "Turn signals",
    "Tail lights",
    "Third brake light",
    "Number-plate light",
    "Puddle / welcome lights",
    "Underglow",
  ],
  rims: [
    "Front rims",
    "Rear rims",
    "Centre caps",
    "Wheel hubs",
    "Brake calipers",
    "Tyres & sidewall lettering",
    "Wheel arches & fender liners",
    "Lug nuts",
  ],
  body: [
    "Paint split line where the two faces meet",
    "Front bumper",
    "Grille",
    "Bonnet",
    "Front fenders",
    "Mirror housings",
    "Door sides",
    "Door handles",
    "Side skirts",
    "Roof & roof rails",
    "Pillars A/B/C/D",
    "Tailgate",
    "Rear bumper & diffuser",
    "Exhaust tips",
    "Badges & emblems",
    "Decals, livery & car name",
  ],
  interior: [
    "Dashboard",
    "Head unit surround",
    "A-pillars & tweeter pods",
    "Door cards",
    "Door speaker grilles",
    "Steering wheel",
    "Gear selector & centre console",
    "Front seats",
    "Second-row seats",
    "Headliner",
    "Floor mats & carpet",
    "Ambient lighting",
    "Stitching & seat belts",
  ],
  trunk: [
    "Trunk floor",
    "Amplifier rack",
    "Subwoofer enclosure",
    "Show lighting for amps & sub",
    "Battery & distribution cover",
    "Trunk side panels",
    "Tailgate trim & show panel",
  ],
};

/** Total number of catalogue spots. New requests are numbered after it (N62, N63, …). */
export const LOCATION_COUNT = Object.values(BONUS_LOCATIONS).reduce((n, l) => n + l.length, 0);

/** Element values: one of A–D, a combination, or a note when it is not a bonus element. */
export const ELEMENT_OPTIONS = ["A", "B", "C", "D", "A/B", "A/D", "B/D", "C/D", "Overall design", "—"] as const;

export const STRENGTHS = ["strong", "medium", "weak", "unlikely"] as const;
export type Strength = (typeof STRENGTHS)[number];

export function groupInfo(key: string) {
  return BONUS_GROUPS.find((g) => g.key === key) ?? BONUS_GROUPS[BONUS_GROUPS.length - 1];
}

/** Code = group prefix + request number, e.g. L05, N62. */
export function bonusCode(group: string, no: number) {
  return `${groupInfo(group).prefix}${String(no).padStart(2, "0")}`;
}

/** Next request number: after every existing number and after the catalogue (so new ones start at N62). */
export function nextBonusNo(existing: readonly { no: number }[]) {
  return Math.max(LOCATION_COUNT, ...existing.map((r) => r.no)) + 1;
}
