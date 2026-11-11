"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Set by the editor in preview mode (no Supabase) so the pencils can be tried locally. */
export const PREVIEW_EDITOR_FLAG = "ba-preview-editor";
const HIDE_KEY = "ba-hide-edit-buttons";

type Ctx = { canEdit: boolean; visible: boolean; setVisible: (v: boolean) => void };
const EditCtx = createContext<Ctx>({ canEdit: false, visible: false, setVisible: () => {} });

/**
 * Shows edit shortcuts on public pages only to signed-in editors.
 * Visitors and judges never see them; editors can hide them (e.g. while presenting).
 */
export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [canEdit, setCanEdit] = useState(false);
  const [visible, setVisibleState] = useState(true);

  useEffect(() => {
    let alive = true;
    try {
      setVisibleState(localStorage.getItem(HIDE_KEY) !== "1");
    } catch {
      // storage blocked: keep defaults
    }
    (async () => {
      if (!isSupabaseConfigured) {
        try {
          if (alive) setCanEdit(localStorage.getItem(PREVIEW_EDITOR_FLAG) === "1");
        } catch {
          // ignore
        }
        return;
      }
      const db = createClient();
      if (!db) return;
      // Reads the stored session only (no network) to keep visitors' page loads light.
      const { data } = await db.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid) return;
      const { data: ed } = await db.from("editors").select("role").eq("user_id", uid).maybeSingle();
      if (alive) setCanEdit(!!ed);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setVisible = (v: boolean) => {
    setVisibleState(v);
    try {
      localStorage.setItem(HIDE_KEY, v ? "0" : "1");
    } catch {
      // ignore
    }
  };

  return (
    <EditCtx.Provider value={{ canEdit, visible, setVisible }}>
      {children}
      {canEdit && <EditBar />}
    </EditCtx.Provider>
  );
}

function PencilIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

type PencilProps = {
  /** Editor URL, e.g. "/editor/vehicle/#f-statement". */
  href: string;
  /** What gets edited, read by screen readers and shown on hover. */
  label: string;
  /** Default: top-right corner of the nearest positioned parent. */
  className?: string;
  tone?: "dark" | "light";
};

/** Round pencil shortcut to the matching field in the editor. Renders nothing for visitors. */
export function EditPencil({ href, label, className = "right-3 top-3", tone = "dark" }: PencilProps) {
  const { canEdit, visible } = useContext(EditCtx);
  if (!canEdit || !visible) return null;
  const colors = tone === "dark" ? "bg-lemon text-prussian ring-prussian/30" : "bg-prussian text-lemon ring-black/20";
  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={`Edit: ${label}`}
      title={`Edit: ${label}`}
      className={`absolute z-20 inline-flex h-11 w-11 items-center justify-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.35)] ring-2 transition-transform hover:scale-110 ${colors} ${className}`}
    >
      <PencilIcon />
    </Link>
  );
}

/** Floating bar for editors: open the editor, or hide the pencils while presenting. */
function EditBar() {
  const { visible, setVisible } = useContext(EditCtx);
  return (
    <div
      role="region"
      aria-label="Editor shortcuts"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-prussian/90 p-1.5 pl-4 text-ink shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur"
    >
      <span className="flex items-center gap-2 pr-2 font-mono text-[11px] tracking-[0.12em] text-lemon">
        <PencilIcon size={14} /> EDIT MODE
      </span>
      <button
        type="button"
        aria-pressed={!visible}
        onClick={() => setVisible(!visible)}
        className="pill min-h-10 cursor-pointer px-4 text-[13px] text-ink hover:bg-white/10"
      >
        {visible ? "Hide edit buttons" : "Show edit buttons"}
      </button>
      <Link href="/editor/" prefetch={false} className="pill min-h-10 bg-lemon px-4 text-[13px] text-prussian">
        Open editor
      </Link>
    </div>
  );
}
