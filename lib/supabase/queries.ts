import "server-only";
import { cache } from "react";
import { PLACEHOLDER } from "../data/placeholder";
import type { SiteContent } from "../types";
import { createPublicClient } from "./server";

type TableMap = {
  [K in keyof Omit<SiteContent, "vehicle">]: { table: string; order?: string };
};

const TABLES: TableMap = {
  milestones: { table: "milestones", order: "sort" },
  competitions: { table: "competitions", order: "date" },
  components: { table: "components", order: "sort" },
  wiring: { table: "wiring_links" },
  tuning: { table: "tuning" },
  photos: { table: "photos", order: "sort" },
  craft: { table: "craft_photos", order: "sort" },
  bonus: { table: "bonus_requests", order: "sort" },
  evidence: { table: "judge_evidence" },
  team: { table: "team", order: "sort" },
  partners: { table: "partners", order: "sort" },
  beforeAfter: { table: "before_after" },
  zones: { table: "theme_zones", order: "sort" },
};

/** Columns the public may read; `strength` on bonus requests is editor-only. */
const COLUMNS: Partial<Record<string, string>> = {
  bonus_requests: 'id, no, code, "group", title, element, description, photo_path, submit, idea, execution, sort',
};

/** Tables without a draft/publish status column. */
const NO_STATUS = new Set(["judge_evidence"]);

/**
 * All public content. Reads only `published` rows from Supabase; any table that
 * is unavailable or empty falls back to the placeholder content, so the site
 * always renders.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const db = createPublicClient();
  if (!db) return PLACEHOLDER;

  const out: SiteContent = { ...PLACEHOLDER };

  const vehicle = await db.from("vehicle").select("*").eq("status", "published").limit(1).maybeSingle();
  if (vehicle.data) out.vehicle = { ...PLACEHOLDER.vehicle, ...vehicle.data };

  await Promise.all(
    (Object.keys(TABLES) as (keyof TableMap)[]).map(async (key) => {
      const { table, order } = TABLES[key];
      let q = db.from(table).select(COLUMNS[table] ?? "*");
      if (!NO_STATUS.has(table)) q = q.eq("status", "published");
      if (order) q = q.order(order, { ascending: true });
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        (out as Record<string, unknown>)[key] = key === "bonus" ? (data as unknown[]).map((r) => ({ ...(r as object), strength: null })) : data;
      } else if (key === "evidence") {
        out.evidence = [];
      }
    }),
  );

  // Never let editor-only data reach a public page, whatever the source.
  out.bonus = out.bonus.map((b) => ({ ...b, strength: null }));
  return out;
});
