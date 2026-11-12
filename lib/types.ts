import type { CriterionKey, EmmaClass } from "./emma/matrix";
import type { Execution } from "./emma/bonus";
import type { BonusGroup, Strength } from "./emma/bonus-locations";
import type { CarPhotoLayout, HeroLayout, Hotspot } from "./photo";

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
  /** Theme page: a photo and short points per side. */
  dark_side_photo_path?: string | null;
  light_side_photo_path?: string | null;
  dark_side_points?: string[] | null;
  light_side_points?: string[] | null;
  /** Theme page: one car photo with numbered points, each motif with its meaning. */
  motif_photo_path?: string | null;
  motifs?: Motif[] | null;
  /** More cut-out car photos for the landing hero slider (after car_photo_path), in order. */
  hero_photos?: BonusMedia[] | null;
  /** Photos of the car under the story on the History page (slider), in order. */
  history_photos?: BonusMedia[] | null;
  /** Square tiles of photos / videos under the History slider. */
  history_gallery?: BonusMedia[] | null;
  /** Headline / story placement on the History page (lib/page-layout.ts). */
  history_layout?: unknown;
  /** Headline / intro placement per page: { installation, bonus, judge } (lib/page-layout.ts). */
  page_layouts?: unknown;
  /** Landing-page text and options (lib/home.ts). */
  home?: unknown;
  /** Hero car position and size per screen size (see lib/photo.ts). */
  car_photo_layout: CarPhotoLayout | null;
  /** Uploaded system diagram for the Installation page, and its text description. */
  system_diagram_path: string | null;
  system_diagram_alt: string;
  /** Uploaded cable / wiring diagram for the Power & fuses section, and its text description. */
  wiring_diagram_path: string | null;
  wiring_diagram_alt: string;
  /** Tuning notes shown on the Installation page. */
  tuning_eq: string;
  tuning_listening: string;
  tuning_measurement: string;
  updated_at: string | null;
};

/** A motif on the car: a point on the motif photo (in %) with its title and meaning. */
export type Motif = { id: string; title: string; meaning: string; x: number; y: number };

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
  "capacitor",
  "other",
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
  /** Clickable areas on the uploaded system diagram image. */
  hotspots: Hotspot[];
  /** Clickable areas on the uploaded wiring diagram image. */
  wiring_hotspots: Hotspot[];
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
  sort: number;
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
  /** Diagram key of the component this photo shows (optional; used by the circuit card). */
  component_key?: string | null;
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
  /** How it was made: photos and videos with a caption each, in order. */
  process?: BonusMedia[] | null;
  /** The finished result: photos and videos with a caption each. */
  result?: BonusMedia[] | null;
  sort: number;
};

/** A photo or video on a bonus request. A video is an uploaded file (path) or a link (url). */
export type BonusMedia = {
  id: string;
  kind: "photo" | "video";
  path: string | null;
  url?: string | null;
  caption: string;
  /** Position & size of the photo in its frame (History slider). */
  layout?: HeroLayout | null;
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
  /** Position & size of the logo in its box (see lib/photo.ts › HeroLayout). */
  logo_layout?: HeroLayout | null;
  sort: number;
};

export type BeforeAfter = {
  id: string;
  view: "exterior" | "dashboard" | "trunk";
  before_path: string | null;
  after_path: string | null;
};

export type ThemeZone = {
  id: string;
  sort: number;
  key: "exterior" | "interior" | "trunk";
  name: string;
  criterion: string;
  photo_path: string | null;
  elements: string[];
};

export type MoodItem = {
  id: string;
  caption: string;
  path: string | null;
  sort: number;
};

/** One step of a power or ground run: a part (node, optionally a fuse) or a cable between parts. */
export type ChainItem =
  | { id: string; t: "node"; label: string; fuse_a?: number | null; /** A fuse, even when its rating is not filled in yet. */ is_fuse?: boolean }
  | { id: string; t: "cable"; name: string; awg: string | null; length_cm: number | null };

/** A cable outside the power/ground run: RCA signal, speaker cable or anything else. */
export type SideCable = {
  id: string;
  role: "signal" | "speaker" | "other";
  from: string;
  to: string;
  /** Product at the far end (e.g. the speaker), shown with its name. */
  to_key?: string | null;
  name: string;
  awg: string | null;
  length_cm: number | null;
};

/**
 * A run on the cable diagram. "trunk": battery to a distribution / ground block
 * (shared). "channel": one device fed from a trunk, with its own cables.
 */
export type Circuit = {
  id: string;
  name: string;
  kind: "trunk" | "channel";
  /** Fuse position as labelled on the distribution block, e.g. "A7" (block A, 7th fuse). */
  fuse_code?: string | null;
  /** Product shown in the circuit (spec sheet), e.g. the amplifier. */
  component_key: string | null;
  /** The trunk circuits this run continues from (power + / ground −). */
  power_from: string | null;
  ground_from: string | null;
  power: ChainItem[];
  ground: ChainItem[];
  cables: SideCable[];
  /** Click areas on the device itself (the amplifier, speaker, …). */
  wiring_hotspots: Hotspot[];
  /** Parts on the cable diagram this run passes through (fuse holder, distribution, ground block, …). */
  parts: PathPart[];
  sort: number;
};

/** A marked part on the cable diagram: lit up with every circuit that runs through it. */
export type PathPart = Hotspot & {
  id: string;
  /** Shown on the diagram, e.g. "Fuse A7", "Distribution A", "Ground block A". */
  label: string;
  /** Which run it belongs to: + only, − only, or both (ultracap, VSS). */
  run: "power" | "ground" | "both";
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
  moodboard: MoodItem[];
  circuits: Circuit[];
};
