import type { CriterionKey, EmmaClass } from "./emma/matrix";
import type { Execution } from "./emma/bonus";
import type { BonusGroup, Strength } from "./emma/bonus-locations";

export type Status = "draft" | "published";

export type Vehicle = {
  id: string;
  name: string;
  model: string;
  year: string;
  category: string;
  class: EmmaClass;
  event: string;
  dark_side_name: string;
  light_side_name: string;
  dark_side_body: string;
  light_side_body: string;
  statement: string;
  story: string;
  owner: string;
  installer: string;
  designer: string;
  tuner: string;
  instagram: string;
  website: string;
  car_photo_path: string | null;
  updated_at: string | null;
};

export type Milestone = {
  id: string;
  when_label: string;
  title: string;
  body: string;
  photo_path: string | null;
  sort: number;
};

export type Competition = {
  id: string;
  event: string;
  city: string;
  category: string;
  install_points: string;
  result: string;
  date: string | null;
};

export const COMPONENT_TYPES = [
  "head_unit",
  "dsp",
  "amplifier",
  "speaker",
  "battery",
  "main_fuse",
  "distribution",
] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export type SpecRow = { k: string; v: string };

export type AudioComponent = {
  id: string;
  /** Stable node key used by diagrams, e.g. "hu", "dsp", "amp_a", "tweeter". */
  key: string;
  title: string;
  role: string;
  type: ComponentType;
  brand: string;
  model: string;
  specs: SpecRow[];
  note: string;
  photo_path: string | null;
  pdf_path: string | null;
  in_system: boolean;
  in_wiring: boolean;
  /** For the signal-flow diagram: which node feeds this one. */
  fed_by: string | null;
  sort: number;
};

export type WiringLink = {
  id: string;
  from_key: string;
  to_key: string;
  cable_mm2: number | null;
  fuse_a: number | null;
};

export type TuningRow = {
  id: string;
  driver: string;
  hpf_hz: string;
  lpf_hz: string;
  slope_db: string;
  time_align_ms: string;
  eq_bands: string;
};

export const PHOTO_AREAS = [
  { key: "engine", label: "Engine Bay", code: "EB" },
  { key: "doors", label: "Doors", code: "DR" },
  { key: "dash", label: "Dashboard", code: "DB" },
  { key: "trunk", label: "Trunk", code: "TR" },
  { key: "floor", label: "Under Floor", code: "UF" },
] as const;
export type PhotoArea = (typeof PHOTO_AREAS)[number]["key"];

export type Photo = {
  id: string;
  area: PhotoArea;
  code: string;
  caption: string;
  proves_criterion: CriterionKey | null;
  path: string | null;
  sort: number;
};

export const CRAFT_CATEGORIES = [
  { key: "wiring", label: "Wiring" },
  { key: "hu", label: "Head Unit" },
  { key: "amps", label: "Amplifiers" },
  { key: "spk", label: "Speakers" },
  { key: "other", label: "Other Components" },
] as const;
export type CraftCategory = (typeof CRAFT_CATEGORIES)[number]["key"];

export type CraftPhoto = {
  id: string;
  category: CraftCategory;
  caption: string;
  path: string | null;
  sort: number;
};

export type BonusRequest = {
  id: string;
  no: number;
  /** Auto code: group prefix + number, e.g. L05, N62. */
  code: string;
  group: BonusGroup;
  title: string;
  /** "A"–"D", a combination like "B/D", "Overall design" or "—". */
  element: string;
  description: string;
  photo_path: string | null;
  submit: boolean;
  idea: boolean;
  execution: Execution;
  /** Editor-only judgement. Never sent to public pages. */
  strength: Strength | null;
  sort: number;
};

/** What public pages receive: no `strength`. */
export type PublicBonusRequest = Omit<BonusRequest, "strength">;

export type JudgeEvidence = {
  criterion_key: CriterionKey;
  ready: boolean;
  note: string;
  updated_by: string | null;
  updated_at: string | null;
};

export type TeamMember = {
  id: string;
  role: string;
  name: string;
  line: string;
  photo_path: string | null;
  sort: number;
};

export type Partner = {
  id: string;
  name: string;
  logo_path: string | null;
  url: string | null;
  sort: number;
};

export type BeforeAfter = {
  id: string;
  view: "exterior" | "dashboard" | "trunk";
  before_path: string | null;
  after_path: string | null;
};

export type ThemeZone = {
  key: "exterior" | "interior" | "trunk";
  name: string;
  criterion: string;
  photo_path: string | null;
  elements: string[];
};

export type SiteContent = {
  vehicle: Vehicle;
  milestones: Milestone[];
  competitions: Competition[];
  components: AudioComponent[];
  wiring: WiringLink[];
  tuning: TuningRow[];
  photos: Photo[];
  craft: CraftPhoto[];
  bonus: BonusRequest[];
  evidence: JudgeEvidence[];
  team: TeamMember[];
  partners: Partner[];
  beforeAfter: BeforeAfter[];
  zones: ThemeZone[];
};
