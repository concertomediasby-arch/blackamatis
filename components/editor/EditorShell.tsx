"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/editor/data";
import { normPath } from "@/lib/nav";
import { useEditor } from "./EditorProvider";

const NAV = [
  { href: "/editor", label: "Overview" },
  { href: "/editor/vehicle", label: "Vehicle & Story" },
  { href: "/editor/history", label: "History" },
  { href: "/editor/theme", label: "Theme" },
  { href: "/editor/components", label: "Components" },
  { href: "/editor/photos", label: "Photo Log" },
  { href: "/editor/bonus", label: "Bonus Requests" },
];

const time = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null);

export function EditorShell({ children }: { children: React.ReactNode }) {
  const pathname = normPath(usePathname());
  const router = useRouter();
  const { session, dirty, unpublished, saving, lastSaved, error, save, publish, stateLoading, publishState } = useEditor();
  const nothingSaved = session.mode === "supabase" && !!publishState && Object.values(publishState).every((t) => t.rows === 0);
  const [menu, setMenu] = useState(false);

  // Deep links from the public site's edit pencils: /editor/vehicle/#f-statement
  // scrolls to that section, focuses its first field and highlights it briefly.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("edit-target");
      el.querySelector<HTMLElement>("input:not([type=hidden]), textarea, select")?.focus({ preventScroll: true });
      setTimeout(() => el.classList.remove("edit-target"), 2600);
    }, 250);
    return () => clearTimeout(t);
  }, [pathname]);

  const status = stateLoading
    ? "Checking status…"
    : saving
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : unpublished
        ? `Draft · unpublished changes${lastSaved ? ` · saved ${time(lastSaved)}` : ""}`
        : nothingSaved
          ? "Nothing saved yet · site shows placeholders"
          : "Published · up to date";

  return (
    <div className="editor flex min-h-screen bg-editor text-[#14141a]">
      <a href="#editor-main" className="sr-only-focusable pill absolute left-4 top-4 z-50 bg-lemon text-black">
        Skip to content
      </a>
      <aside
        className={`${menu ? "flex" : "hidden"} fixed inset-y-0 left-0 z-40 w-[260px] flex-col gap-6 bg-prussian p-5 text-ink md:sticky md:top-0 md:flex md:h-screen`}
        aria-label="Editor"
      >
        <div className="flex flex-col gap-1 px-2 pt-2">
          <span className="font-display text-[22px] font-extrabold tracking-[0.08em]">BLACK AMATIS</span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted-2">EDITOR</span>
        </div>
        <nav aria-label="Editor sections">
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {NAV.map((n) => {
              const on = n.href === "/editor" ? pathname === "/editor" : pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={on ? "page" : undefined}
                    onClick={() => {
                      setMenu(false);
                      if (dirty) void save();
                    }}
                    className={`flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold ${on ? "bg-lemon text-prussian" : "text-muted hover:bg-white/10 hover:text-ink"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-white/10 px-2 pt-4 text-xs text-muted-2">
          <span>{session.mode === "preview" ? "Preview mode (no Supabase)" : session.email}</span>
          <span className="font-mono tracking-[0.1em]">ROLE: {session.role.toUpperCase()}</span>
          <Link href="/judge" className="text-amber hover:text-lemon">
            Open Judge Mode →
          </Link>
          {session.mode === "supabase" && (
            <button
              type="button"
              onClick={async () => {
                if (dirty) await save();
                await signOut();
                router.replace("/editor/login/");
              }}
              className="min-h-11 cursor-pointer text-left text-ink underline"
            >
              Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-editor-border bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-editor-border md:hidden"
            aria-label="Editor menu"
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span role="status" className="flex items-center gap-2 text-sm text-[#3a3a42]">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${dirty || unpublished ? "bg-amber" : "bg-emerald-600"}`} />
            {status}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <a href="/" target="_blank" className="pill border border-editor-border bg-white text-prussian">
              View public site
            </a>
            <button type="button" onClick={() => void save()} disabled={saving || !dirty} className="pill cursor-pointer border border-prussian bg-white text-prussian disabled:opacity-50">
              Save draft
            </button>
            <button
              type="button"
              onClick={() => void publish()}
              disabled={saving || session.role !== "owner" || (!dirty && !unpublished)}
              title={session.role !== "owner" ? "Only the owner can publish" : undefined}
              className="pill cursor-pointer bg-prussian text-lemon disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </header>
        {session.mode === "preview" && (
          <p className="m-0 border-b border-amber/40 bg-[#FFF6CC] px-4 py-2.5 text-sm sm:px-8">
            Preview mode: Supabase is not connected, so drafts are stored in this browser only and do not reach the public site. Set the Supabase env vars to
            enable login and publishing.
          </p>
        )}
        {error && (
          <p role="alert" className="m-0 border-b border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-800 sm:px-8">
            {error}
          </p>
        )}
        <main id="editor-main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
