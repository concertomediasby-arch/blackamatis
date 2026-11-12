"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getEditorContent, getEditorSession, signOut, type EditorSession } from "@/lib/editor/data";
import type { SiteContent } from "@/lib/types";
import { EditorProvider } from "./EditorProvider";
import { EditorShell } from "./EditorShell";

type State =
  | { kind: "loading" }
  | { kind: "not-editor"; email: string }
  | { kind: "error"; message: string }
  | { kind: "ready"; session: EditorSession; content: SiteContent };

/** Client-side auth guard: Supabase session + editors row, then load drafts. */
export function EditorGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await getEditorSession();
        if (!alive) return;
        if (s.kind === "signed-out") return router.replace("/editor/login/");
        if (s.kind === "not-editor") return setState({ kind: "not-editor", email: s.email });
        const content = await getEditorContent(s.session);
        if (alive) setState({ kind: "ready", session: s.session, content });
      } catch (e) {
        if (alive) setState({ kind: "error", message: e instanceof Error ? e.message : "Could not load the editor" });
      }
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  if (state.kind === "ready") {
    return (
      <EditorProvider session={state.session} initial={state.content}>
        <EditorShell>{children}</EditorShell>
      </EditorProvider>
    );
  }

  return (
    <div className="editor flex min-h-screen items-center justify-center bg-editor p-4 text-[#14141a]">
      <div role={state.kind === "loading" ? "status" : "alert"} className="flex max-w-[440px] flex-col gap-4 rounded-2xl border border-editor-border bg-white p-8">
        <span className="font-display text-2xl font-extrabold tracking-[0.08em] text-prussian">BLACK AMETHYST · EDITOR</span>
        {state.kind === "loading" && <p className="m-0">Checking your login…</p>}
        {state.kind === "not-editor" && (
          <>
            <p className="m-0">
              {state.email} is signed in but is not on the editor list yet. Ask the owner to add this account.
            </p>
            <button
              type="button"
              className="pill cursor-pointer bg-prussian text-lemon"
              onClick={async () => {
                await signOut();
                router.replace("/editor/login/");
              }}
            >
              Sign out
            </button>
          </>
        )}
        {state.kind === "error" && (
          <>
            <p className="m-0">The editor could not load: {state.message}</p>
            <button type="button" className="pill cursor-pointer bg-prussian text-lemon" onClick={() => window.location.reload()}>
              Try again
            </button>
            <Link href="/" className="text-sm underline">
              Back to the site
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
