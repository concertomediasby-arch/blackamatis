"use client";

import { PLACEHOLDER } from "../data/placeholder";
import { createClient } from "../supabase/client";
import { CONTENT_TABLES, fetchEditorContent } from "../supabase/content";
import { isSupabaseConfigured } from "../supabase/env";
import type { SiteContent } from "../types";

/**
 * Editor data access, entirely in the browser. Permissions are enforced by
 * Supabase RLS: editors write drafts, only owners can set status = 'published'.
 */

export type EditorRole = "owner" | "editor";
export type EditorSession =
  | { mode: "preview"; email: null; role: "owner" }
  | { mode: "supabase"; email: string; role: EditorRole; userId: string };

export type SessionResult = { kind: "ok"; session: EditorSession } | { kind: "signed-out" } | { kind: "not-editor"; email: string };

/** Tables saved by "Save draft" (judge evidence is saved per tick). */
const WRITE_TABLES = CONTENT_TABLES.filter((t) => t.key !== "evidence");
const ALL_TABLES = ["vehicle", ...WRITE_TABLES.map((t) => t.table)];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ensureId = (id: string) => (UUID.test(id) ? id : crypto.randomUUID());

function db() {
  const c = createClient();
  if (!c) throw new Error("Supabase is not configured");
  return c;
}

export async function getEditorSession(): Promise<SessionResult> {
  if (!isSupabaseConfigured) return { kind: "ok", session: { mode: "preview", email: null, role: "owner" } };
  const { data } = await db().auth.getUser();
  if (!data.user) return { kind: "signed-out" };
  const { data: ed } = await db().from("editors").select("role").eq("user_id", data.user.id).maybeSingle();
  if (!ed) return { kind: "not-editor", email: data.user.email ?? "" };
  return { kind: "ok", session: { mode: "supabase", email: data.user.email ?? "", role: ed.role as EditorRole, userId: data.user.id } };
}

export async function getEditorContent(session: EditorSession): Promise<SiteContent> {
  if (session.mode === "preview") return PLACEHOLDER;
  return fetchEditorContent(db());
}

/** Save everything as draft. Returns the content with database ids. */
export async function saveDraft(session: EditorSession, content: SiteContent): Promise<{ content: SiteContent; savedAt: string }> {
  const savedAt = new Date().toISOString();
  if (session.mode === "preview") return { content, savedAt };
  const client = db();

  const next: SiteContent = { ...content };
  const vehicle = { ...content.vehicle, id: ensureId(content.vehicle.id), status: "draft", updated_by: session.userId, updated_at: savedAt };
  const vr = await client.from("vehicle").upsert(vehicle);
  if (vr.error) throw new Error(`vehicle: ${vr.error.message}`);
  next.vehicle = { ...content.vehicle, id: vehicle.id };

  for (const { key, table } of WRITE_TABLES) {
    const rows = (content[key] as { id: string }[]).map((r) => ({ ...r, id: ensureId(r.id), status: "draft", updated_at: savedAt }));
    if (rows.length) {
      const { error } = await client.from(table).upsert(rows);
      if (error) throw new Error(`${table}: ${error.message}`);
    }
    const ids = rows.map((r) => r.id);
    const del = client.from(table).delete();
    const { error: delErr } = ids.length ? await del.not("id", "in", `(${ids.join(",")})`) : await del.neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr) throw new Error(`${table}: ${delErr.message}`);
    (next as Record<string, unknown>)[key] = rows.map((r) => {
      const { status: _s, updated_at: _u, ...rest } = r;
      void _s;
      void _u;
      return rest;
    });
  }
  return { content: next, savedAt };
}

/** Publish all drafts (owner only; RLS rejects anyone else). */
export async function publishAll(session: EditorSession): Promise<{ ok: boolean; error?: string; publishedAt?: string }> {
  if (session.role !== "owner") return { ok: false, error: "Only the owner can publish." };
  const publishedAt = new Date().toISOString();
  if (session.mode === "preview") return { ok: true, publishedAt };
  for (const t of ALL_TABLES) {
    const { error } = await db().from(t).update({ status: "published" }).eq("status", "draft");
    if (error) return { ok: false, error: `${t}: ${error.message}` };
  }
  return { ok: true, publishedAt };
}

/** Tick evidence for a judge criterion (stored with the editor who changed it). */
export async function saveEvidence(session: EditorSession, criterion_key: string, ready: boolean, note = "") {
  if (session.mode === "preview") return { ok: true as const };
  const { error } = await db()
    .from("judge_evidence")
    .upsert({ criterion_key, ready, note, updated_by: session.userId, updated_at: new Date().toISOString() });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function signOut() {
  await createClient()?.auth.signOut();
}
