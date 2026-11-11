import type { SupabaseClient } from "@supabase/supabase-js";
import { PLACEHOLDER } from "../data/placeholder";
import type { SiteContent } from "../types";

type ListKey = keyof Omit<SiteContent, "vehicle">;

/** SiteContent key → table, with sort order. */
export const CONTENT_TABLES: { key: ListKey; table: string; order?: string }[] = [
  { key: "milestones", table: "milestones", order: "sort" },
  { key: "competitions", table: "competitions", order: "date" },
  { key: "components", table: "components", order: "sort" },
  { key: "wiring", table: "wiring_links" },
  { key: "tuning", table: "tuning", order: "sort" },
  { key: "photos", table: "photos", order: "sort" },
  { key: "craft", table: "craft_photos", order: "sort" },
  { key: "bonus", table: "bonus_requests", order: "sort" },
  { key: "evidence", table: "judge_evidence" },
  { key: "team", table: "team", order: "sort" },
  { key: "partners", table: "partners", order: "sort" },
  { key: "beforeAfter", table: "before_after" },
  { key: "zones", table: "theme_zones", order: "sort" },
  { key: "moodboard", table: "moodboard_items", order: "sort" },
];

/** Columns the public may read; `strength` on bonus requests is editor-only. */
const PUBLIC_COLUMNS: Partial<Record<string, string>> = {
  bonus_requests: 'id, no, code, "group", title, element, description, photo_path, submit, idea, execution, sort',
};

/** Tables without a draft/publish status column. */
const NO_STATUS = new Set(["judge_evidence"]);

export class ContentError extends Error {}

/** Empty database columns fall back to the placeholder value instead of showing "null". */
function withoutNulls<T extends object>(row: T): Partial<T> {
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== null)) as Partial<T>;
}

/**
 * Published content for public pages (anon key + RLS). A table with no published
 * rows falls back to the placeholder content; a network or permission error throws.
 */
export async function fetchPublishedContent(db: SupabaseClient): Promise<SiteContent> {
  const out: SiteContent = { ...PLACEHOLDER, evidence: [] };

  const vehicle = await db.from("vehicle").select("*").eq("status", "published").limit(1).maybeSingle();
  if (vehicle.error) throw new ContentError(vehicle.error.message);
  if (vehicle.data) out.vehicle = { ...PLACEHOLDER.vehicle, ...withoutNulls(vehicle.data) };

  await Promise.all(
    CONTENT_TABLES.map(async ({ key, table, order }) => {
      let q = db.from(table).select(PUBLIC_COLUMNS[table] ?? "*");
      if (!NO_STATUS.has(table)) q = q.eq("status", "published");
      if (order) q = q.order(order, { ascending: true });
      const { data, error } = await q;
      if (error) throw new ContentError(`${table}: ${error.message}`);
      if (data && data.length > 0) (out as Record<string, unknown>)[key] = data;
    }),
  );

  // Never let editor-only data reach a public page.
  out.bonus = out.bonus.map((b) => ({ ...b, strength: null }));
  return out;
}

/** Everything an editor can see, drafts included (RLS lets editors read all rows). */
export async function fetchEditorContent(db: SupabaseClient): Promise<SiteContent> {
  const out: SiteContent = { ...PLACEHOLDER, evidence: [] };
  const v = await db.from("vehicle").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (v.error) throw new ContentError(v.error.message);
  if (v.data) out.vehicle = { ...PLACEHOLDER.vehicle, ...withoutNulls(v.data) };
  await Promise.all(
    CONTENT_TABLES.map(async ({ key, table, order }) => {
      let q = db.from(table).select("*");
      if (order) q = q.order(order, { ascending: true });
      const { data, error } = await q;
      if (error) throw new ContentError(`${table}: ${error.message}`);
      if (data && data.length) (out as Record<string, unknown>)[key] = data;
    }),
  );
  return out;
}
