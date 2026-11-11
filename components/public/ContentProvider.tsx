"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PLACEHOLDER } from "@/lib/data/placeholder";
import { createClient } from "@/lib/supabase/client";
import { fetchPublishedContent } from "@/lib/supabase/content";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SiteContent } from "@/lib/types";

export type ContentState =
  | { status: "loading" }
  | { status: "error"; message: string; retry: () => void }
  | { status: "ready"; content: SiteContent };

const Ctx = createContext<ContentState | null>(null);

/** Loads published content once per visit; kept across client-side page navigations. */
export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ContentState>(() =>
    isSupabaseConfigured
      ? { status: "loading" }
      : { status: "ready", content: PLACEHOLDER },
  );

  const load = useCallback(async () => {
    const db = createClient();
    if (!db) return;
    setState({ status: "loading" });
    try {
      setState({ status: "ready", content: await fetchPublishedContent(db) });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Unknown error",
        retry: () => void load(),
      });
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) void load();
  }, [load]);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useSiteContent(): ContentState {
  const s = useContext(Ctx);
  if (!s)
    throw new Error("useSiteContent must be used inside <ContentProvider>");
  return s;
}

/** Vehicle fields for chrome (header/footer) without blocking on loading. */
export function useVehicleField<K extends keyof SiteContent["vehicle"]>(
  key: K,
): SiteContent["vehicle"][K] | null {
  const s = useSiteContent();
  return s.status === "ready" ? s.content.vehicle[key] : null;
}

/** Skeleton while loading, error panel with retry on failure. */
export function ContentFallback({
  state,
}: {
  state: Exclude<ContentState, { status: "ready" }>;
}) {
  if (state.status === "error") {
    return (
      <section role="alert" className="mx-auto max-w-[720px] px-5 py-32">
        <div className="glass-dark flex flex-col items-start gap-5 rounded-[36px] p-8 sm:p-12">
          <span className="eyebrow text-amber">Connection problem</span>
          <h1 className="display m-0 text-5xl font-extrabold">
            The build data didn&apos;t load.
          </h1>
          <p className="m-0 leading-relaxed text-muted">
            Check your connection and try again. If it keeps happening, ask the
            team at the car.
          </p>
          <button
            type="button"
            onClick={state.retry}
            className="pill bg-amber text-prussian"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="px-8 sm:px-[72px] lg:px-[88px] flex flex-col gap-6 pb-24 pt-24"
    >
      <span className="sr-only">Loading the build…</span>
      <div className="skeleton h-4 w-40 rounded-full" />
      <div className="skeleton h-28 w-full max-w-[640px] rounded-3xl" />
      <div className="skeleton h-5 w-full max-w-[520px] rounded-full" />
      <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-56 rounded-[28px]" />
        ))}
      </div>
      <div className="skeleton h-72 w-full rounded-[36px]" />
    </div>
  );
}
