"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  SAVE_KEYS,
  TABLE_OF,
  getPublishState,
  publishAll,
  saveDraft,
  snapshotOf,
  type EditorSession,
  type PublishState,
  type SaveKey,
} from "@/lib/editor/data";
import type { SiteContent } from "@/lib/types";
import { PLACEHOLDER } from "@/lib/data/placeholder";
import { PREVIEW_EDITOR_FLAG } from "@/components/public/EditMode";

const LS_KEY = "ba-editor-draft-v1";
const AUTOSAVE_MS = 10_000;

type Ctx = {
  session: EditorSession;
  content: SiteContent;
  update: (fn: (c: SiteContent) => SiteContent) => void;
  dirty: boolean;
  /** True when saved drafts exist that are not published yet (read from the database). */
  unpublished: boolean;
  saving: boolean;
  /** Last save, from the database (or this browser in preview mode). */
  lastSaved: string | null;
  lastPublished: string | null;
  /** Per-table state from the database; null in preview mode or while loading. */
  publishState: PublishState | null;
  stateLoading: boolean;
  error: string | null;
  save: () => Promise<void>;
  publish: () => Promise<void>;
  /** Tables changed somewhere else (another tab, another team member) since this editor loaded them. */
  stale: string[];
  /** Save what is pending here, then load the latest content. */
  reload: () => Promise<void>;
};

const EditorContext = createContext<Ctx | null>(null);

export function useEditor() {
  const c = useContext(EditorContext);
  if (!c) throw new Error("useEditor must be used inside <EditorProvider>");
  return c;
}

const snapshots = (c: SiteContent) => Object.fromEntries(SAVE_KEYS.map((k) => [k, snapshotOf(c, k)])) as Record<SaveKey, string>;

export function EditorProvider({ session, initial, children }: { session: EditorSession; initial: SiteContent; children: React.ReactNode }) {
  const [content, setContent] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [localUnpublished, setLocalUnpublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localSaved, setLocalSaved] = useState<string | null>(null);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<PublishState | null>(null);
  const [stateLoading, setStateLoading] = useState(session.mode === "supabase");
  const [error, setError] = useState<string | null>(null);
  // In preview mode, wait for the browser draft before rendering forms (they read their defaults once).
  const [ready, setReady] = useState(session.mode !== "preview");
  const contentRef = useRef(content);
  contentRef.current = content;
  /** What is stored right now, per part; a part is saved only when it differs. */
  const savedRef = useRef(snapshots(initial));
  /** The content as loaded / last saved here: a save writes only the differences from it. */
  const baseRef = useRef(initial);
  /** Latest change per table that this editor knows about (its own saves included). */
  const knownRef = useRef<Record<string, string | null> | null>(null);
  const [stale, setStale] = useState<string[]>([]);

  /** Compare the database with what this editor knows; remember tables changed elsewhere. */
  const checkStale = useCallback(async () => {
    if (session.mode !== "supabase") return;
    let st: PublishState | null = null;
    try {
      st = await getPublishState(session);
    } catch {
      return;
    }
    if (!st) return;
    if (!knownRef.current) {
      knownRef.current = Object.fromEntries(Object.entries(st).map(([t, v]) => [t, v.last]));
      return;
    }
    const known = knownRef.current;
    const changed = Object.entries(st)
      .filter(([t, v]) => v.last && (!known[t] || v.last > known[t]!))
      .map(([t]) => t);
    if (changed.length) setStale((s) => [...new Set([...s, ...changed])]);
  }, [session]);

  const refreshState = useCallback(async () => {
    if (session.mode !== "supabase") return;
    try {
      setPublishState(await getPublishState(session));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the publish status");
    } finally {
      setStateLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refreshState();
    void checkStale();
  }, [refreshState, checkStale]);

  // Look for changes made elsewhere every 45 s and whenever the tab comes back into view.
  useEffect(() => {
    if (session.mode !== "supabase") return;
    const t = setInterval(() => void checkStale(), 45_000);
    const onFocus = () => document.visibilityState === "visible" && void checkStale();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [session.mode, checkStale]);

  // Preview mode: restore the draft kept in this browser.
  useEffect(() => {
    if (session.mode !== "preview") return;
    try {
      // Lets the public pages show their edit pencils in preview mode.
      localStorage.setItem(PREVIEW_EDITOR_FLAG, "1");
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { content: SiteContent; savedAt: string; publishedAt?: string; unpublished?: boolean };
        // Drafts stored by an older version may lack newer sections: fill them from the defaults.
        const restored: SiteContent = { ...PLACEHOLDER, ...saved.content, vehicle: { ...PLACEHOLDER.vehicle, ...saved.content.vehicle } };
        setContent(restored);
        savedRef.current = snapshots(restored);
        setLocalSaved(saved.savedAt);
        setLastPublished(saved.publishedAt ?? null);
        setLocalUnpublished(!!saved.unpublished);
      }
    } catch {
      // storage unavailable: start from the server content
    }
    setReady(true);
  }, [session.mode]);

  const update = useCallback((fn: (c: SiteContent) => SiteContent) => {
    setContent((c) => fn(c));
    setDirty(true);
  }, []);

  const persistLocal = (patch: Record<string, unknown>) => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      localStorage.setItem(LS_KEY, JSON.stringify({ ...prev, ...patch }));
    } catch {
      setError("Could not store the draft in this browser (storage full or blocked).");
    }
  };

  const save = useCallback(async () => {
    const current = contentRef.current;
    const changed = SAVE_KEYS.filter((k) => snapshotOf(current, k) !== savedRef.current[k]);
    if (changed.length === 0) {
      // e.g. only an evidence tick changed: those save on their own.
      setDirty(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Notice changes made elsewhere before this save, so they are reported, not absorbed.
      await checkStale();
      const res = await saveDraft(session, current, changed, baseRef.current);
      // Decide now, before any state update below re-renders and replaces contentRef.
      const editedMeanwhile = contentRef.current !== current;
      for (const k of changed) savedRef.current[k] = snapshotOf(res.content, k);
      const nextBase = { ...baseRef.current };
      for (const k of changed) (nextBase as Record<string, unknown>)[k] = k === "vehicle" ? res.content.vehicle : res.content[k];
      baseRef.current = nextBase;
      if (session.mode === "preview") {
        persistLocal({ content: res.content, savedAt: res.savedAt, unpublished: true });
        setLocalSaved(res.savedAt);
        setLocalUnpublished(true);
      } else {
        // Take the database ids, unless the user kept typing meanwhile: then keep
        // their newer edits (the next save writes them; stale rows are removed).
        if (!editedMeanwhile) setContent(res.content);
        await refreshState();
        // This save is now the latest known change of the tables it wrote.
        try {
          const st = await getPublishState(session);
          if (st && knownRef.current) for (const k of changed) knownRef.current[TABLE_OF[k]] = st[TABLE_OF[k]]?.last ?? null;
        } catch {
          // the next check fills it in
        }
      }
      // Edits made while saving stay dirty and are picked up by the next autosave.
      setDirty(editedMeanwhile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [session, refreshState, checkStale]);

  const reload = useCallback(async () => {
    if (dirty) await save();
    window.location.reload();
  }, [dirty, save]);

  const publish = useCallback(async () => {
    if (dirty) await save();
    setSaving(true);
    const res = await publishAll(session);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Publish failed");
      return;
    }
    setLastPublished(res.publishedAt!);
    if (session.mode === "preview") {
      setLocalUnpublished(false);
      persistLocal({ publishedAt: res.publishedAt, unpublished: false });
    } else {
      await refreshState();
    }
  }, [dirty, save, session, refreshState]);

  // Autosave every 10 s while there are unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [dirty, content, save]);

  // Unsaved-changes guard on reload / tab close.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const states = publishState ? Object.values(publishState) : [];
  const unpublished = session.mode === "supabase" ? states.some((s) => s.drafts > 0) : localUnpublished;
  const lastSaved =
    session.mode === "supabase" ? states.reduce<string | null>((a, s) => (s.last && (!a || s.last > a) ? s.last : a), null) : localSaved;

  return (
    <EditorContext.Provider
      value={{ session, content, update, dirty, unpublished, saving, lastSaved, lastPublished, publishState, stateLoading, error, save, publish, stale, reload }}
    >
      {ready ? children : <p className="p-8 text-sm">Loading draft…</p>}
    </EditorContext.Provider>
  );
}
