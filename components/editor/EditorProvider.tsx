"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { publishAll, saveDraft, type EditorSession } from "@/lib/editor/data";
import type { SiteContent } from "@/lib/types";
import { PREVIEW_EDITOR_FLAG } from "@/components/public/EditMode";

const LS_KEY = "ba-editor-draft-v1";
const AUTOSAVE_MS = 10_000;

type Ctx = {
  session: EditorSession;
  content: SiteContent;
  update: (fn: (c: SiteContent) => SiteContent) => void;
  dirty: boolean;
  /** True when there are saved drafts not yet published. */
  unpublished: boolean;
  saving: boolean;
  lastSaved: string | null;
  lastPublished: string | null;
  error: string | null;
  save: () => Promise<void>;
  publish: () => Promise<void>;
};

const EditorContext = createContext<Ctx | null>(null);

export function useEditor() {
  const c = useContext(EditorContext);
  if (!c) throw new Error("useEditor must be used inside <EditorProvider>");
  return c;
}

export function EditorProvider({ session, initial, children }: { session: EditorSession; initial: SiteContent; children: React.ReactNode }) {
  const [content, setContent] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [unpublished, setUnpublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // In preview mode, wait for the browser draft before rendering forms (they read their defaults once).
  const [ready, setReady] = useState(session.mode !== "preview");
  const contentRef = useRef(content);
  contentRef.current = content;

  // Preview mode: restore the draft kept in this browser.
  useEffect(() => {
    if (session.mode !== "preview") return;
    try {
      // Lets the public pages show their edit pencils in preview mode.
      localStorage.setItem(PREVIEW_EDITOR_FLAG, "1");
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { content: SiteContent; savedAt: string; publishedAt?: string; unpublished?: boolean };
        setContent(saved.content);
        setLastSaved(saved.savedAt);
        setLastPublished(saved.publishedAt ?? null);
        setUnpublished(!!saved.unpublished);
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
    setSaving(true);
    setError(null);
    try {
      const res = await saveDraft(session, contentRef.current);
      if (session.mode === "preview") {
        persistLocal({ content: res.content, savedAt: res.savedAt, unpublished: true });
      } else {
        setContent(res.content);
      }
      setLastSaved(res.savedAt);
      setDirty(false);
      setUnpublished(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [session]);

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
    setUnpublished(false);
    if (session.mode === "preview") persistLocal({ publishedAt: res.publishedAt, unpublished: false });
  }, [dirty, save, session]);

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

  return (
    <EditorContext.Provider value={{ session, content, update, dirty, unpublished, saving, lastSaved, lastPublished, error, save, publish }}>
      {ready ? children : <p className="p-8 text-sm">Loading draft…</p>}
    </EditorContext.Provider>
  );
}
