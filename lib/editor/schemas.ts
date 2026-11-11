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

export const bonusSchema = z.object({
  id: z.string(),
  no: z.number().int().min(1),
  code: z.string(),
  group: z.enum(BONUS_GROUPS.map((g) => g.key) as [BonusGroup, ...BonusGroup[]]),
  title: text(160).min(1, "Give the request a name"),
  element: z.string().min(1, "Choose an element"),
  description: text(800),
  photo_path: z.string().nullable(),
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
  path: z.string().nullable(),
  sort: z.number(),
});
