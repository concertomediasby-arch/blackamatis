"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { isIos, pushState, turnOff, turnOn, type PushState } from "@/lib/push";

const COPY: Record<PushState, string> = {
  on: "On. You will get a notification when the team posts news about Black Amethyst.",
  off: "Get a notification on this device when the team posts news about Black Amethyst.",
  denied:
    "Notifications are blocked for this site. Allow them in your browser's site settings, then come back here.",
  "ios-install":
    "On iPhone and iPad: tap Share, then Add to Home Screen. Open Black Amethyst from your home screen and turn notifications on here.",
  unsupported: "This browser cannot show notifications. Try Chrome, Edge or Firefox, or Safari on a Mac.",
};

/** Gear button in the header: a small Settings panel with the news notifications switch. */
export function SettingsMenu({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    pushState().then(setState).catch(() => setState("unsupported"));
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      setState(state === "on" ? await turnOff() : await turnOn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const canToggle = state === "on" || state === "off";
  return (
    <div className="relative">
      <button
        ref={button}
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        aria-controls="site-settings"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border ${
          light ? "border-black/40 hover:bg-black/10" : "border-white/30 hover:bg-white/10"
        }`}
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          ref={panel}
          id="site-settings"
          role="dialog"
          aria-label="Settings"
          tabIndex={-1}
          className="fixed inset-x-4 top-24 z-50 flex flex-col sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[340px] gap-4 rounded-[28px] border border-white/15 bg-[rgba(1,20,53,0.96)] p-6 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.55)] outline-none backdrop-blur-[24px]"
        >
          <span className="font-mono text-[11px] tracking-[0.14em] text-amber">SETTINGS</span>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span id="notif-label" className="text-[16px] font-semibold">
                News notifications
              </span>
              {canToggle && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={state === "on"}
                  aria-labelledby="notif-label"
                  disabled={busy}
                  onClick={toggle}
                  className={`relative inline-flex h-8 w-14 flex-none cursor-pointer items-center rounded-full border transition-colors disabled:opacity-60 ${
                    state === "on" ? "border-amber bg-amber" : "border-white/30 bg-white/10"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute h-6 w-6 rounded-full transition-transform ${
                      state === "on" ? "translate-x-7 bg-prussian" : "translate-x-1 bg-ink"
                    }`}
                  />
                </button>
              )}
            </div>
            <p className="m-0 text-[14px] leading-relaxed text-muted" aria-live="polite">
              {state === null ? "Checking this device…" : busy ? "One moment…" : COPY[state]}
            </p>
            {state === "ios-install" && isIos() && (
              <p className="m-0 font-mono text-[11px] tracking-[0.08em] text-muted-2">
                SHARE ⬆︎ › ADD TO HOME SCREEN
              </p>
            )}
            {error && <p className="m-0 text-[14px] text-[#FFB199]">{error}</p>}
          </div>
          <Link
            href="/news/"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center text-[14px] font-semibold text-amber hover:text-lemon"
          >
            See all news →
          </Link>
        </div>
      )}
    </div>
  );
}
