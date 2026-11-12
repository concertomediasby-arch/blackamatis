import type { CriterionKey } from "../emma/matrix";
import { bonusCode } from "../emma/bonus-locations";
import type {
  AudioComponent,
  ComponentType,
  CraftPhoto,
  Photo,
  PhotoArea,
  SiteContent,
} from "../types";

/**
 * Static placeholder content. Unknown values stay as visible placeholders
 * until the editor fills them. Never invent specs, scores, dates or names.
 */

let n = 0;
const id = (p: string) => `${p}-${++n}`;

const comp = (
  key: string,
  title: string,
  role: string,
  type: ComponentType,
  note: string,
  opts: Partial<AudioComponent> = {},
): AudioComponent => ({
  id: id("c"),
  key,
  title,
  role,
  type,
  brand: "",
  model: "",
  specs: [],
  note,
  photo_path: null,
  pdf_path: null,
  in_system: false,
  in_wiring: false,
  fed_by: null,
  hotspots: [],
  wiring_hotspots: [],
  sort: n,
  ...opts,
});

const SPK_NOTE = "Fill in from the manufacturer datasheet.";
const AMP_NOTE = "Fuse rating must match the smallest cable in its circuit.";

const components: AudioComponent[] = [
  comp("hu", "Head Unit", "SOURCE", "head_unit", "Explain any hidden wiring behind the unit in the documentation.", {
    in_system: true,
    in_wiring: true,
  }),
  comp("dsp", "DSP", "PROCESSING", "dsp", "Show the channel assignment in the system documentation.", {
    in_system: true,
    in_wiring: true,
    fed_by: "hu",
  }),
  comp("amp_a", "Amplifier A", "AMPLIFICATION", "amplifier", AMP_NOTE, {
    in_system: true,
    in_wiring: true,
    fed_by: "dsp",
  }),
  comp("amp_b", "Amplifier B", "AMPLIFICATION", "amplifier", AMP_NOTE, {
    in_system: true,
    in_wiring: true,
    fed_by: "dsp",
  }),
  comp("tweeter", "Tweeter L/R", "SPEAKERS", "speaker", SPK_NOTE, { in_system: true, fed_by: "amp_a" }),
  comp("mid", "Midrange L/R", "SPEAKERS", "speaker", SPK_NOTE, { in_system: true, fed_by: "amp_a" }),
  comp("midbass", "Midbass L/R", "SPEAKERS", "speaker", SPK_NOTE, { in_system: true, fed_by: "amp_a" }),
  comp("sub", "Subwoofer", "SPEAKERS", "speaker", SPK_NOTE, { in_system: true, fed_by: "amp_b" }),
  comp("battery", "Main Battery", "POWER SOURCE", "battery", "Every battery needs its own main fuse.", {
    in_wiring: true,
  }),
  comp(
    "main_fuse",
    "Main Fuse",
    "PROTECTION",
    "main_fuse",
    "Within 40 cm of the positive battery post and before any metal panel.",
    { in_wiring: true },
  ),
  comp("dist", "Distribution Block", "DISTRIBUTION", "distribution", "All terminals covered by non-conductive material.", {
    in_wiring: true,
  }),
];

const PHOTO_SEED: Record<PhotoArea, [string, CriterionKey][]> = {
  engine: [
    ["Main fuse & distance to + post", "main_fuse"],
    ["Battery terminal cover", "terminations_protected"],
    ["Firewall grommet", "wires_protected"],
    ["Power cable routing", "wires_protected"],
  ],
  doors: [
    ["Door speaker mounting", "securely_mounted"],
    ["Door cable boot & sleeving", "wires_protected"],
    ["Speaker terminations sealed against moisture", "terminations_protected"],
    ["Front speaker grille", "speaker_protection"],
  ],
  dash: [
    ["Behind the head unit", "wires_terminated"],
    ["Driver-seat view, doors closed", "wires_invisible"],
    ["Driver-seat view, doors open", "wires_invisible"],
    ["Driver & passenger footwell", "normal_use"],
  ],
  trunk: [
    ["Amplifier terminations", "wires_terminated"],
    ["Amplifier fuses", "all_wires_fused"],
    ["Amplifier mounting brackets", "securely_mounted"],
    ["Subwoofer enclosure fixing", "securely_mounted"],
  ],
  floor: [
    ["Cable routing under the carpet", "system_documentation"],
    ["Signal & power runs separated", "craftsmanship"],
    ["Distribution block cover", "terminations_protected"],
    ["Chassis ground point", "fuse_value"],
  ],
};

const AREA_CODE: Record<PhotoArea, string> = { engine: "EB", doors: "DR", dash: "DB", trunk: "TR", floor: "UF" };

const photos: Photo[] = (Object.keys(PHOTO_SEED) as PhotoArea[]).flatMap((area) =>
  PHOTO_SEED[area].map(([caption, proves], i) => ({
    id: id("p"),
    area,
    code: `${AREA_CODE[area]}-${String(i + 1).padStart(2, "0")}`,
    caption,
    proves_criterion: proves,
    path: null,
    sort: i,
  })),
);

const CRAFT_SEED: Record<CraftPhoto["category"], string[]> = {
  wiring: ["Loom & sleeving", "Strain relief", "Routing & fastening"],
  hu: ["Screen surround", "Panel gaps", "Dash integration"],
  amps: ["Amp rack", "Terminal access", "Cover panel edges"],
  spk: ["A-pillar / pod", "Grille alignment", "Baffle finish"],
  other: ["DSP mount", "Battery box", "Trim details"],
};

const craft: CraftPhoto[] = (Object.keys(CRAFT_SEED) as CraftPhoto["category"][]).flatMap((category) =>
  CRAFT_SEED[category].map((caption, i) => ({ id: id("cr"), category, caption, path: null, sort: i })),
);

export const PLACEHOLDER: SiteContent = {
  vehicle: {
    id: "vehicle",
    name: "Black Amethyst",
    model: "Honda Odyssey",
    year: "[YEAR]",
    category: "[CATEGORY]",
    class: "X",
    event: "EMMA 2026",
    dark_side_name: "[DARK SIDE NAME]",
    light_side_name: "[LIGHT SIDE NAME]",
    dark_side_body: "[Dark side: its character, mood, and the elements that express it — materials, finishes, lighting.]",
    light_side_body: "[Light side: the opposite character, and how the two sides meet in one car.]",
    statement:
      "[Write the concept statement here: why Black Amethyst was built in a two-face style, what it should say to judges and spectators, and how the theme carries from the exterior and interior to the trunk.]",
    story:
      "[Story summary: where this Odyssey came from, why it was chosen as the project base, and who was involved in building it.]",
    owner: "[OWNER NAME]",
    installer: "[WORKSHOP NAME]",
    designer: "[DESIGNER NAME]",
    tuner: "[TUNER NAME]",
    instagram: "[@INSTAGRAM]",
    website: "",
    car_photo_path: null,
    history_photos: [],
    history_side_text: "",
    history_gallery: [],
    hero_photos: [],
    dark_side_photo_path: null,
    light_side_photo_path: null,
    dark_side_points: [],
    light_side_points: [],
    motif_photo_path: null,
    motifs: [],
    car_photo_layout: null,
    system_diagram_path: null,
    system_diagram_alt: "",
    wiring_diagram_path: null,
    wiring_diagram_alt: "",
    tuning_eq: "[EQ approach: number of bands, per-channel or global, main corrections.]",
    tuning_listening: "[Driver seat / centre / both: what the system is tuned for.]",
    tuning_measurement: "[Microphone and software used.]",
    updated_at: null,
  },
  milestones: [
    { id: id("m"), when_label: "[YEAR]", title: "Car acquired", body: "[Starting condition, why the Honda Odyssey was chosen as the base.]", photo_path: null, sort: 1 },
    { id: id("m"), when_label: "[MONTH]", title: "The two-face concept is born", body: "[Where the two-face idea came from and what the name Black Amethyst means.]", photo_path: null, sort: 2 },
    { id: id("m"), when_label: "[MONTH]", title: "Design & system planning", body: "[Sketches, signal flow plan, component selection.]", photo_path: null, sort: 3 },
    { id: id("m"), when_label: "[MONTH]", title: "Fabrication & installation", body: "[Panel work, wiring, power system, trunk build.]", photo_path: null, sort: 4 },
    { id: id("m"), when_label: "[MONTH]", title: "Tuning & finishing", body: "[Sound tuning, final details, cleanliness check.]", photo_path: null, sort: 5 },
    { id: id("m"), when_label: "2026", title: "EMMA 2026", body: "[Target category and events entered.]", photo_path: null, sort: 6 },
  ],
  competitions: [1, 2, 3].map(() => ({
    id: id("ev"),
    event: "[Event name]",
    city: "[City]",
    category: "[Category]",
    install_points: "[ / max]",
    result: "[Placing]",
    date: null,
  })),
  components,
  wiring: [
    { id: id("w"), from_key: "battery", to_key: "main_fuse", cable_mm2: null, fuse_a: null },
    { id: id("w"), from_key: "main_fuse", to_key: "dist", cable_mm2: null, fuse_a: null },
    { id: id("w"), from_key: "dist", to_key: "amp_a", cable_mm2: null, fuse_a: null },
    { id: id("w"), from_key: "dist", to_key: "amp_b", cable_mm2: null, fuse_a: null },
    { id: id("w"), from_key: "dist", to_key: "dsp", cable_mm2: null, fuse_a: null },
    { id: id("w"), from_key: "dist", to_key: "hu", cable_mm2: null, fuse_a: null },
  ],
  tuning: ["Tweeter", "Midrange", "Midbass", "Subwoofer"].map((driver, i) => ({
    id: id("t"),
    driver,
    hpf_hz: "[__ Hz]",
    lpf_hz: "[__ Hz]",
    slope_db: "[__ dB/oct]",
    time_align_ms: "[__ ms]",
    eq_bands: "[__]",
    sort: i + 1,
  })),
  photos,
  craft,
  bonus: (
    [
      ["lights", "A", "strong", "Tail lights with holographic audio-brand logos (Concerto Malang, STEG, Audiocircle/Zelos)"],
      ["body", "D", "strong", "Sound-wave / heartbeat line across the bonnet (lime side)"],
      ["body", "B/D", "strong", "Yellow stacked-bar ornament at the sills, reads like an EQ meter (confirm meaning)"],
      ["body", "A", "strong", "Audio-brand livery on side skirts and doors (Audiocircle, STEG, Zelos)"],
      ["lights", "B", "medium", "Custom headlights: blue projectors, purple halo, green figures inside"],
      ["lights", "B", "medium", "Purple LED grille bars and illuminated front emblem"],
      ["lights", "B", "medium", "Smoked tail lights with purple figures inside"],
      ["glass", "B/D", "medium", "Wayang gunungan motif on rear quarter glass and tailgate"],
      ["body", "B/D", "medium", "Gold wayang figure across doors and glass, both sides"],
      ["body", "B", "medium", "Colour character illustration on the lime-side front door"],
      ["body", "B/D", "medium", "Yellow tower / lantern ornament on the black-side tailgate"],
      ["body", "D", "medium", "Mirrored floral / batik line art"],
      ["body", "Overall design", "weak", "Two-face split paint, lime and black"],
      ["rims", "—", "weak", "Multi-piece rims, polished lips, lowered stance"],
      ["glass", "D", "weak", "EMMA Asian Finals 2026 banners on windscreen and rear glass"],
      ["body", "—", "unlikely", "Twin exhaust tips"],
    ] as const
  ).map(([group, element, strength, title], i) => ({
    id: id("b"),
    no: i + 1,
    code: bonusCode(group, i + 1),
    group,
    title,
    element,
    description: "[Describe the element, why it is extraordinary, and how it was made.]",
    photo_path: null,
    submit: false,
    idea: false,
    execution: 0 as const,
    strength,
    sort: i + 1,
  })),
  evidence: [],
  team: [
    { id: id("tm"), role: "Owner", name: "[OWNER NAME]", line: "[One line about the owner.]", photo_path: null, sort: 1 },
    { id: id("tm"), role: "Installer", name: "[WORKSHOP NAME]", line: "[Installation, fabrication, wiring.]", photo_path: null, sort: 2 },
    { id: id("tm"), role: "Design", name: "[DESIGNER NAME]", line: "[Concept, two-face styling.]", photo_path: null, sort: 3 },
    { id: id("tm"), role: "Tuning", name: "[TUNER NAME]", line: "[DSP setup and sound tuning.]", photo_path: null, sort: 4 },
  ],
  partners: Array.from({ length: 6 }, (_, i) => ({
    id: id("pt"),
    name: "[PARTNER LOGO]",
    logo_path: null,
    url: null,
    sort: i,
  })),
  beforeAfter: [
    { id: id("ba"), view: "exterior", before_path: null, after_path: null },
    { id: id("ba"), view: "dashboard", before_path: null, after_path: null },
    { id: id("ba"), view: "trunk", before_path: null, after_path: null },
  ],
  zones: [
    { id: id("z"), sort: 1, key: "exterior", name: "Exterior", criterion: "Overall design of vehicle", photo_path: null, elements: ["[Theme element 1]", "[Theme element 2]", "[Theme element 3]"] },
    { id: id("z"), sort: 2, key: "interior", name: "Interior", criterion: "Design of interior", photo_path: null, elements: ["[Theme element 1]", "[Theme element 2]", "[Theme element 3]"] },
    { id: id("z"), sort: 3, key: "trunk", name: "Trunk", criterion: "Design of trunk", photo_path: null, elements: ["[Theme element 1]", "[Theme element 2]", "[Theme element 3]"] },
  ],
  circuits: [],
  moodboard: ["Concept sketch", "Reference", "Reference", "Render / mockup"].map((caption, i) => ({ id: id("mb"), caption, path: null, sort: i + 1 })),
};
