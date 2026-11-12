"use client";

import { PLACEHOLDER } from "../data/placeholder";
import { createClient } from "../supabase/client";
import { CONTENT_TABLES, fetchEditorContent } from "../supabase/content";
import { isSupabaseConfigured } from "../supabase/env";
import { stableUuid } from "./ids";
import { normalizeMedia } from "../bonus-media";
import { normalizeCircuit } from "../circuits";
import { normalizeHotspots } from "../photo";
import { dedupeKeys } from "./components";
import type { Circuit, SiteContent } from "../types";

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

/** Parts of the content that "Save draft" writes, each to its own table. */
export type SaveKey = "vehicle" | Exclude<keyof SiteContent, "vehicle" | "evidence">;
export const SAVE_KEYS: SaveKey[] = ["vehicle", ...(WRITE_TABLES.map((t) => t.key) as SaveKey[])];
export const TABLE_OF: Record<SaveKey, string> = Object.fromEntries([
  ["vehicle", "vehicle"],
  ...WRITE_TABLES.map((t) => [t.key, t.table]),
]) as Record<SaveKey, string>;

/** Snapshot of one part of the content, used to detect what changed since the last save. */
export const snapshotOf = (c: SiteContent, key: SaveKey) => JSON.stringify(key === "vehicle" ? c.vehicle : c[key]);

/** Per-table publish state, read from the database. */
export type TableState = { rows: number; drafts: number; last: string | null; lastBy: string | null };
export type PublishState = Record<string, TableState>;


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

/** A save error the team can act on, instead of a raw database message. */
export function explainDbError(table: string, message: string): string {
  const m = message.toLowerCase();
  if (m.includes("duplicate key")) return `Save failed (${table}): two items use the same value that must be unique. Check the diagram keys in Components.`;
  if (m.includes("row-level security") || m.includes("permission denied")) return `Save failed (${table}): this account may not change it. Sign in again, or ask the owner.`;
  if (m.includes("failed to fetch") || m.includes("network")) return "Save failed: no connection. Your changes are still here; try again in a moment.";
  return `Save failed (${table}): ${message}`;
}

/** Read how many rows and drafts each table has, and when/by whom it was last saved. */
export async function getPublishState(session: EditorSession): Promise<PublishState | null> {
  if (session.mode === "preview") return null;
  const out: PublishState = {};
  await Promise.all(
    ALL_TABLES.map(async (table) => {
      const { data, error } = await db().from(table).select("status, updated_at, updated_by");
      if (error) throw new Error(`${table}: ${error.message}`);
      const rows = (data ?? []) as { status: string; updated_at: string | null; updated_by: string | null }[];
      const latest = rows.reduce<(typeof rows)[number] | null>((a, r) => (!a || (r.updated_at ?? "") > (a.updated_at ?? "") ? r : a), null);
      out[table] = { rows: rows.length, drafts: rows.filter((r) => r.status === "draft").length, last: latest?.updated_at ?? null, lastBy: latest?.updated_by ?? null };
    }),
  );
  return out;
}

/**
 * Save the given parts (only what changed). The owner's saves go live at once
 * (status "published"): there is one copy of the content, so a draft status
 * would take that part off the public site until Publish. An editor's saves
 * stay drafts until the owner publishes them (RLS: only owners may publish).
 * Returns the content with database ids.
 */
export async function saveDraft(session: EditorSession, content: SiteContent, keys: SaveKey[] = SAVE_KEYS): Promise<{ content: SiteContent; savedAt: string }> {
  const savedAt = new Date().toISOString();
  if (session.mode === "preview") return { content, savedAt };
  const client = db();
  const status = session.role === "owner" ? "published" : "draft";

  const next: SiteContent = { ...content };
  if (keys.includes("vehicle")) {
    const vehicle = { ...content.vehicle, id: await stableUuid(content.vehicle.id), status, updated_by: session.userId, updated_at: savedAt };
    const vr = await client.from("vehicle").upsert(vehicle);
    if (vr.error) throw new Error(explainDbError("vehicle", vr.error.message));
    // There is one vehicle: remove any other row so the site can never show a stale copy.
    const vd = await client.from("vehicle").delete().neq("id", vehicle.id);
    if (vd.error) throw new Error(`vehicle: ${vd.error.message}`);
    next.vehicle = { ...content.vehicle, id: vehicle.id };
  }

  for (const { key, table } of WRITE_TABLES) {
    if (!keys.includes(key as SaveKey)) continue;
    // Diagram keys must be unique: a later duplicate gets a suffix ("amp" -> "amp_2").
    const source = table === "components" ? dedupeKeys(content.components) : (content[key] as { id: string }[]);
    const rows = await Promise.all(
      source.map(async (r) => ({
        ...r,
        ...(table === "components"
          ? {
              hotspots: normalizeHotspots((r as { hotspots?: unknown }).hotspots),
              wiring_hotspots: normalizeHotspots((r as { wiring_hotspots?: unknown }).wiring_hotspots),
            }
          : table === "bonus_requests"
            ? { process: normalizeMedia((r as { process?: unknown }).process), result: normalizeMedia((r as { result?: unknown }).result) }
            : table === "circuits"
              ? (({ id: _i, sort: _s, ...c }) => (void _i, void _s, c))(normalizeCircuit(r as Circuit))
              : {}),
        id: await stableUuid(r.id),
        status,
        updated_by: session.userId,
        updated_at: savedAt,
      })),
    );
    // Remove deleted rows first, so a new row may reuse a value (e.g. a diagram key) of a removed one.
    const ids = rows.map((r) => r.id);
    const del = client.from(table).delete();
    const { error: delErr } = ids.length ? await del.not("id", "in", `(${ids.join(",")})`) : await del.neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr) throw new Error(explainDbError(table, delErr.message));
    if (rows.length) {
      const { error } = await client.from(table).upsert(rows);
      if (error) throw new Error(explainDbError(table, error.message));
    }
    (next as Record<string, unknown>)[key] = rows.map((r) => {
      const { status: _s, updated_at: _u, updated_by: _b, ...rest } = r;
      void _s;
      void _u;
      void _b;
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
