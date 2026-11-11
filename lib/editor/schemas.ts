import { z } from "zod";
import { CLASSES } from "../emma/matrix";
import { COMPONENT_TYPES } from "../types";
import { BONUS_GROUPS, STRENGTHS, type BonusGroup } from "../emma/bonus-locations";

export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export const STATEMENT_MAX_WORDS = 80;

const text = (max: number) => z.string().max(max, `Max ${max} characters`);

export const vehicleSchema = z.object({
  name: text(60).min(1, "Required"),
  model: text(60).min(1, "Required"),
  year: text(40),
  category: text(40),
  class: z.enum(CLASSES),
  event: text(60),
  dark_side_name: text(60),
  light_side_name: text(60),
  dark_side_body: text(600),
  light_side_body: text(600),
  statement: z
    .string()
    .refine((s) => wordCount(s) <= STATEMENT_MAX_WORDS, `Keep the statement to ${STATEMENT_MAX_WORDS} words or fewer`),
  story: text(800),
  owner: text(80),
  installer: text(80),
  designer: text(80),
  tuner: text(80),
  instagram: text(80),
  website: z.union([z.literal(""), z.url("Enter a full URL, e.g. https://…")]),
});
export type VehicleForm = z.infer<typeof vehicleSchema>;

export const milestoneSchema = z.object({
  id: z.string(),
  when_label: text(30).min(1, "Required"),
  title: text(80).min(1, "Required"),
  body: text(500),
  photo_path: z.string().nullable(),
  sort: z.number(),
});

export const teamSchema = z.object({
  id: z.string(),
  role: text(40).min(1, "Required"),
  name: text(80).min(1, "Required"),
  line: text(160),
  photo_path: z.string().nullable(),
  sort: z.number(),
});

export const storyFormSchema = vehicleSchema.extend({
  milestones: z.array(milestoneSchema),
  team: z.array(teamSchema),
});
export type StoryForm = z.infer<typeof storyFormSchema>;

const optionalNumber = z.union([z.number().positive("Must be above 0"), z.null()]);

export const componentSchema = z.object({
  id: z.string(),
  key: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and _ only"),
  title: text(60).min(1, "Required"),
  role: text(40),
  type: z.enum(COMPONENT_TYPES),
  brand: text(60),
  model: text(80),
  specs: z.array(z.object({ k: z.string(), v: text(120) })),
  note: text(300),
  photo_path: z.string().nullable(),
  pdf_path: z.string().nullable(),
  in_system: z.boolean(),
  in_wiring: z.boolean(),
  fed_by: z.string().nullable(),
  hotspots: z.array(z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() })).optional(),
  wiring_hotspots: z.array(z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() })).optional(),
  sort: z.number(),
});
export type ComponentForm = z.infer<typeof componentSchema>;

export const wiringLinkSchema = z.object({
  id: z.string(),
  from_key: z.string().min(1),
  to_key: z.string().min(1),
  cable_mm2: optionalNumber,
  fuse_a: optionalNumber,
});

const bonusMediaSchema = z.object({
  id: z.string(),
  kind: z.enum(["photo", "video"]),
  path: z.string().nullable(),
  url: z.string().max(500).nullable().optional(),
  caption: text(300),
});

export const bonusSchema = z.object({
  id: z.string(),
  no: z.number().int().min(1),
  code: z.string(),
  group: z.enum(BONUS_GROUPS.map((g) => g.key) as [BonusGroup, ...BonusGroup[]]),
  title: text(160).min(1, "Give the request a name"),
  element: z.string().min(1, "Choose an element"),
  description: text(2000),
  photo_path: z.string().nullable(),
  process: z.array(bonusMediaSchema).nullable().optional(),
  result: z.array(bonusMediaSchema).nullable().optional(),
  submit: z.boolean(),
  idea: z.boolean(),
  execution: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  strength: z.enum(STRENGTHS).nullable(),
  sort: z.number(),
});
export type BonusForm = z.infer<typeof bonusSchema>;

export const photoSchema = z.object({
  id: z.string(),
  area: z.enum(["engine", "doors", "dash", "trunk", "floor"]),
  code: z.string().min(1, "Required").max(12),
  caption: text(140).min(1, "Add a caption"),
  proves_criterion: z.string().nullable(),
  component_key: z.string().nullable().optional(),
  path: z.string().nullable(),
  sort: z.number(),
});

// ── Sections added for History, Theme, Tuning, close-ups and partners ──

export const competitionSchema = z.object({
  event: text(120).min(1, "Add the event name"),
  city: text(80),
  category: text(60),
  install_points: text(30),
  result: text(60),
  date: z.union([z.null(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a full date")]),
});

export const partnerSchema = z.object({
  name: text(80).min(1, "Add the partner name"),
  url: z.union([z.null(), z.literal(""), z.url("Enter a full URL, e.g. https://…")]),
});

export const zoneSchema = z.object({
  name: text(40).min(1, "Required"),
  elements: z.array(text(140)).max(8, "Max 8 elements"),
});

export const moodSchema = z.object({ caption: text(80) });

export const craftSchema = z.object({ caption: text(80).min(1, "Add a caption") });

/** Inline field errors for a row: { field: message }. */
export function fieldErrors(schema: z.ZodType, value: unknown): Record<string, string> {
  const r = schema.safeParse(value);
  if (r.success) return {};
  const out: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const k = String(issue.path[0] ?? "");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
