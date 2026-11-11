"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PLACEHOLDER } from "../data/placeholder";
import { isSupabaseConfigured } from "../supabase/env";
import { createClient } from "../supabase/server";
import type { SiteContent } from "../types";

export type EditorRole = "owner" | "editor";
export type EditorSession =
  | { mode: "preview"; email: null; role: "owner" }
  | { mode: "supabase"; email: string; role: EditorRole; userId: string };

/** Content tables written by the editor, in SiteContent key → table order. */
const TABLES: [keyof Omit<SiteContent, "vehicle" | "evidence">, string][] = [
  ["milestones", "milestones"],
  ["competitions", "competitions"],
  ["components", "components"],
  ["wiring", "wiring_links"],
  ["tuning", "tuning"],
  ["photos", "photos"],
  ["craft", "craft_photos"],
  ["bonus", "bonus_requests"],
  ["team", "team"],
  ["partners", "partners"],
  ["beforeAfter", "before_after"],
  ["zones", "theme_zones"],
];
const ALL_TABLES = ["vehicle", ...TABLES.map(([, t]) => t)];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ensureId = (id: string) => (UUID.test(id) ? id : crypto.randomUUID());

export async function getEditorSession(): Promise<EditorSession | null> {
  if (!isSupabaseConfigured) return { mode: "preview", email: null, role: "owner" };
  const db = await createClient();
  const { data } = await db!.auth.getUser();
  if (!data.user) return null;
  const { data: ed } = await db!.from("editors").select("role").eq("user_id", data.user.id).maybeSingle();
  if (!ed) return null;
  return { mode: "supabase", email: data.user.email ?? "", role: ed.role as EditorRole, userId: data.user.id };
}

async function requireEditor() {
  const s = await getEditorSession();
  if (!s) throw new Error("Not signed in as an editor");
  return s;
}

/** Everything the editor can see, drafts included (RLS lets editors read all rows). */
export async function getEditorContent(): Promise<SiteContent> {
  const s = await requireEditor();
  if (s.mode === "preview") return PLACEHOLDER;
  const db = (await createClient())!;
  const out: SiteContent = { ...PLACEHOLDER };
  const v = await db.from("vehicle").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (v.data) out.vehicle = { ...PLACEHOLDER.vehicle, ...v.data };
  await Promise.all(
    TABLES.map(async ([key, table]) => {
      const { data } = await db.from(table).select("*");
      if (data && data.length) (out as Record<string, unknown>)[key] = data;
    }),
  );
  const ev = await db.from("judge_evidence").select("*");
  out.evidence = ev.data ?? [];
  return out;
}

/** Save everything as draft. Returns the content with database ids. */
export async function saveDraft(content: SiteContent): Promise<{ ok: true; content: SiteContent; savedAt: string }> {
  const s = await requireEditor();
  const savedAt = new Date().toISOString();
  if (s.mode === "preview") return { ok: true, content, savedAt };
  const db = (await createClient())!;

  const next: SiteContent = { ...content };
  const vehicle = { ...content.vehicle, id: ensureId(content.vehicle.id), status: "draft", updated_by: s.userId, updated_at: savedAt };
  const vr = await db.from("vehicle").upsert(vehicle);
  if (vr.error) throw new Error(`vehicle: ${vr.error.message}`);
  next.vehicle = { ...content.vehicle, id: vehicle.id };

  for (const [key, table] of TABLES) {
    const rows = (content[key] as { id: string }[]).map((r) => ({ ...r, id: ensureId(r.id), status: "draft", updated_at: savedAt }));
    if (rows.length) {
      const { error } = await db.from(table).upsert(rows);
      if (error) throw new Error(`${table}: ${error.message}`);
    }
    const ids = rows.map((r) => r.id);
    const del = db.from(table).delete();
    const { error: delErr } = ids.length ? await del.not("id", "in", `(${ids.join(",")})`) : await del.neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr) throw new Error(`${table}: ${delErr.message}`);
    (next as Record<string, unknown>)[key] = rows.map((r) => {
      const { status: _s, updated_at: _u, ...rest } = r;
      void _s;
      void _u;
      return rest;
    });
  }
  return { ok: true, content: next, savedAt };
}

/** Publish all drafts. Owner only. Revalidates every public page. */
export async function publishAll(): Promise<{ ok: boolean; error?: string; publishedAt?: string }> {
  const s = await requireEditor();
  if (s.role !== "owner") return { ok: false, error: "Only the owner can publish." };
  const publishedAt = new Date().toISOString();
  if (s.mode === "supabase") {
    const db = (await createClient())!;
    for (const t of ALL_TABLES) {
      const { error } = await db.from(t).update({ status: "published" }).eq("status", "draft");
      if (error) return { ok: false, error: `${t}: ${error.message}` };
    }
  }
  revalidatePath("/", "layout");
  return { ok: true, publishedAt };
}

/** Tick evidence for a judge criterion (stored with the editor who changed it). */
export async function saveEvidence(criterion_key: string, ready: boolean, note = "") {
  const s = await requireEditor();
  if (s.mode === "preview") return { ok: true };
  const db = (await createClient())!;
  const { error } = await db
    .from("judge_evidence")
    .upsert({ criterion_key, ready, note, updated_by: s.userId, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/judge");
  return { ok: true };
}

export async function signOut() {
  const db = await createClient();
  await db?.auth.signOut();
  redirect("/editor/login");
}
