import { CLASSES, MATRIX_ROWS, type CriterionKey, type EmmaClass } from "./matrix";

export const CRITERIA_GROUPS = [
  "Presentation & Documentation",
  "Electrical & Safety",
  "Mounting & Function",
  "Design & Craftsmanship",
] as const;
export type CriteriaGroup = (typeof CRITERIA_GROUPS)[number];

export type Criterion = {
  key: CriterionKey;
  name: string;
  group: CriteriaGroup;
  /** What judges check (paraphrase of the judge book). */
  check: string;
  /** Evidence we prepare for it. */
  evidence: string;
  href: string;
  linkLabel: string;
};

const INST = "/installation";
const PHOTOS = "/installation#photo-log";
const WIRING = "/installation#wiring";

export const CRITERIA: readonly Criterion[] = [
  {
    key: "presentation_public",
    name: "Presentation to the public",
    group: "Presentation & Documentation",
    check: "Car on display and the system available for the public to hear during event hours.",
    evidence: "Display schedule: [TIMES]",
    href: "/",
    linkLabel: "Home page",
  },
  {
    key: "bonus_presentation",
    name: "Bonus presentation to the public",
    group: "Presentation & Documentation",
    check: "Display promoting the components, documentation on show, competitor available for spectators.",
    evidence: "QR code at the car + this website",
    href: "/",
    linkLabel: "Home page",
  },
  {
    key: "cleanliness",
    name: "Cleanliness",
    group: "Presentation & Documentation",
    check: "Car-wash clean exterior, clean cabin, engine bay and trunk, no personal items. −2 per area.",
    evidence: "Pre-judging cleanliness checklist",
    href: "/editor",
    linkLabel: "Checklist",
  },
  {
    key: "system_diagram",
    name: "System / wiring diagram",
    group: "Presentation & Documentation",
    check: "Diagram of the system and its wiring.",
    evidence: "System & wiring diagrams",
    href: INST,
    linkLabel: "Installation",
  },
  {
    key: "system_documentation",
    name: "System documentation",
    group: "Presentation & Documentation",
    check:
      "Signal flow chart, wiring with cable sizes, fuse diagram, hidden components and cables explained.",
    evidence: "Signal flow, wiring diagram, spec sheets",
    href: INST,
    linkLabel: "Installation",
  },
  {
    key: "explanation",
    name: "Explanation of system to the judges",
    group: "Presentation & Documentation",
    check: "Max 7 minutes (X Unlimited 15), no videos. −1 per 30 seconds over time.",
    evidence: "Presentation script [DURATION]",
    href: "/editor",
    linkLabel: "Script",
  },
  {
    key: "main_fuse",
    name: "Main fuse(s) present",
    group: "Electrical & Safety",
    check: "Main fuse within 40 cm of every positive battery post, before any metal panel.",
    evidence: "Main fuse photo + measured distance",
    href: WIRING,
    linkLabel: "Wiring diagram",
  },
  {
    key: "all_wires_fused",
    name: "All wires to components fused",
    group: "Electrical & Safety",
    check: "HU, amplifiers and other devices fused; all fuses shown within 3 minutes.",
    evidence: "Power diagram with fuse locations",
    href: WIRING,
    linkLabel: "Wiring diagram",
  },
  {
    key: "fuse_value",
    name: "Fuse value appropriate",
    group: "Electrical & Safety",
    check: "Fuse rating matches the smallest cable in each circuit (VW75212). −2 per error.",
    evidence: "Cable size & fuse rating per circuit",
    href: WIRING,
    linkLabel: "Wiring diagram",
  },
  {
    key: "wires_invisible",
    name: "Interior wires invisible",
    group: "Electrical & Safety",
    check: "No system wires visible from the driver seat, doors closed or open. −2 per wire.",
    evidence: "Photos from the driver position",
    href: PHOTOS,
    linkLabel: "Installation · Photo log",
  },
  {
    key: "wires_terminated",
    name: "Wires properly terminated",
    group: "Electrical & Safety",
    check: "No exposed strands on power, signal, speaker and control cables.",
    evidence: "Termination photo log",
    href: PHOTOS,
    linkLabel: "Installation · Photo log",
  },
  {
    key: "terminations_protected",
    name: "Wire terminations protected",
    group: "Electrical & Safety",
    check: "Terminals covered by non-conductive material; the bonnet does not count.",
    evidence: "Terminal cover & battery box photos",
    href: PHOTOS,
    linkLabel: "Installation · Photo log",
  },
  {
    key: "wires_protected",
    name: "Wires protected from damage",
    group: "Electrical & Safety",
    check: "Grommets through metal, sleeving near moving or flexing parts.",
    evidence: "Firewall grommet & door routing photos",
    href: PHOTOS,
    linkLabel: "Installation · Photo log",
  },
  {
    key: "securely_mounted",
    name: "All components securely mounted",
    group: "Mounting & Function",
    check: "HU, devices, amplifiers and speakers fixed according to their size and weight. −2 each.",
    evidence: "Bracket & mounting photos",
    href: PHOTOS,
    linkLabel: "Installation · Photo log",
  },
  {
    key: "speaker_protection",
    name: "Protection of speakers",
    group: "Mounting & Function",
    check: "Front speakers below the window line need rigid protection; 3 cm cylinder test.",
    evidence: "Front speaker grille photos",
    href: PHOTOS,
    linkLabel: "Installation · Photo log",
  },
  {
    key: "normal_use",
    name: "Normal use of the vehicle",
    group: "Mounting & Function",
    check: "Driver footwell and controls unchanged from OEM; passenger space equal. Max −6.",
    evidence: "Left & right footwell photos",
    href: PHOTOS,
    linkLabel: "Installation · Photo log",
  },
  {
    key: "first_impression",
    name: "First optic impression",
    group: "Mounting & Function",
    check: "Every component looks finished, not “under construction”. −1 each.",
    evidence: "Finished result gallery",
    href: "/theme",
    linkLabel: "Theme",
  },
  {
    key: "craftsmanship",
    name: "Craftsmanship",
    group: "Design & Craftsmanship",
    check:
      "Wiring, head unit, amplifiers, speakers, other components. M: 2 per category, X: 10 per category.",
    evidence: "Close-up fit & finish photos",
    href: "/installation#craftsmanship",
    linkLabel: "Installation · Craftsmanship",
  },
  {
    key: "design_interior",
    name: "Design of interior",
    group: "Design & Craftsmanship",
    check: "All interior components follow one clear design idea. −1 per element.",
    evidence: "Interior zone",
    href: "/theme#zones",
    linkLabel: "Theme",
  },
  {
    key: "design_trunk",
    name: "Design of trunk",
    group: "Design & Craftsmanship",
    check: "All trunk components follow one clear design idea. −1 per element.",
    evidence: "Trunk zone",
    href: "/theme#zones",
    linkLabel: "Theme",
  },
  {
    key: "design_overall",
    name: "Overall design of vehicle",
    group: "Design & Craftsmanship",
    check: "One theme followed inside, outside and in the trunk.",
    evidence: "Two-face concept",
    href: "/theme",
    linkLabel: "Theme",
  },
  {
    key: "bonus_points",
    name: "Bonus points",
    group: "Design & Craftsmanship",
    check: "Requests submitted with the presentation; max 3 points each.",
    evidence: "Bonus request list",
    href: "/bonus",
    linkLabel: "Bonus Point",
  },
];

export function criterionByKey(key: string): Criterion | undefined {
  return CRITERIA.find((c) => c.key === key);
}

export type JudgedCriterion = Criterion & { maxPts: number; ready: boolean };
export type JudgedGroup = { title: CriteriaGroup; sum: number; items: JudgedCriterion[] };

/** Criteria judged in a class, grouped, with their max points and evidence state. */
export function judgedGroups(cls: EmmaClass, ready: Partial<Record<CriterionKey, boolean>> = {}) {
  const i = CLASSES.indexOf(cls);
  const groups: JudgedGroup[] = CRITERIA_GROUPS.map((title) => ({ title, sum: 0, items: [] }));
  for (const [key, pts] of MATRIX_ROWS) {
    const p = pts[i];
    if (p === null) continue;
    const c = criterionByKey(key)!;
    const g = groups.find((x) => x.title === c.group)!;
    g.items.push({ ...c, maxPts: p, ready: !!ready[key] });
    g.sum += p;
  }
  const visible = groups.filter((g) => g.items.length > 0);
  const total = visible.reduce((s, g) => s + g.sum, 0);
  const readyPts = visible.reduce(
    (s, g) => s + g.items.reduce((t, it) => t + (it.ready ? it.maxPts : 0), 0),
    0,
  );
  const count = visible.reduce((s, g) => s + g.items.length, 0);
  return { groups: visible, total, readyPts, count, pct: total ? Math.round((readyPts / total) * 100) : 0 };
}
